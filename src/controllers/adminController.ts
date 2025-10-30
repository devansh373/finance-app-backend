import { Request, Response } from "express";
import {Pan, User} from "../models/User";
// import Transaction from "../models/Transaction";
import { PrismaClient } from "@prisma/client";
import Product from "../models/Product";
import mongoose from "mongoose";

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password").populate("kyc.pan");
    const usersToSend = users.filter(user=>user.role==="USER")
    res.json(usersToSend);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 1. Check if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format." });
    }

    // 2. Find and delete the user
    const user = await User.findByIdAndDelete(id);

    // 3. Check if a user was actually found and deleted
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 4. Send success response
    // We can also send the deleted user's info, but a message is often enough.
    res.status(200).json({ message: "User deleted successfully." });
    
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// export const getAllTransactions = async (_req: Request, res: Response) => {
//   try {
//     const txns = await Transaction.find()
//       .populate("productId", "name price")
//       .populate("userId", "name email");
//     res.json(txns);
//   } catch (err) {
//     res.status(500).json({ msg: "Server error" });
//   }
// };




const prisma = new PrismaClient();
// -------------------------------------------------


export const getAllTransactions = async (_req: Request, res: Response) => {
  try {
    // 1️⃣ Fetch all transactions from PostgreSQL, including the wallet
    //    to get the associated userId.
    const txns = await prisma.transaction.findMany({
      include: {
        wallet: {
          select: {
            userId: true, // We only need the userId from the wallet
          },
        },
      },
    });

    if (txns.length === 0) {
      return res.json([]);
    }

    // 2️⃣ Get unique User IDs and Product IDs from the transactions
    const userIds = [
      ...new Set(txns.map((txn) => txn.wallet.userId)),
    ];
    
    const productIds = [
      ...new Set(
        txns.map((txn: any) => (txn.meta as any).productId)
      ),
    ];

    // 3️⃣ Fetch all related Users and Products from MongoDB in two efficient queries
    const users = await User.find({ _id: { $in: userIds } }).select("name email");
    const products = await Product.find({ _id: { $in: productIds } }).select(
      "name price"
    );

    // 4️⃣ Create maps for quick data lookup
    const userMap = new Map(users.map((user:any) => [user._id.toString(), user]));
    const productMap = new Map(products.map((product:any) => [
      product._id.toString(),
      product,
    ]));

    // 5️⃣ "Populate" the transactions manually
    const populatedTxns = txns.map((txn: any) => {
      const meta = txn.meta as any;
      const user = userMap.get(txn.wallet.userId);
      const product = productMap.get(meta.productId);

      // Clean up the response to match the original Mongoose populate
      const { wallet, ...restOfTxn } = txn; 

      return {
        ...restOfTxn,
        userId: user || null,     // Attach the populated user
        productId: product || null, // Attach the populated product
      };
    });

    res.json(populatedTxns);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ msg: err.message || "Server error" });
  }
};


/**
 * @desc    Get all PAN submissions that are pending approval
 * @route   GET /api/v1/admin/kyc/pending-pans
 * @access  Private (Admin)
 */
export const getPendingPans = async (req: any, res: any) => {
  try {
    // Find all PAN documents with "Approval_Pending" status
    // Populate the 'user' field to show admin who submitted it
    const pendingPans = await Pan.find({ status: "Approval_Pending" }).populate(
      "user",
      "name email"
    );

    if (!pendingPans || pendingPans.length === 0) {
      return res.json({ msg: "No pending PAN submissions found." });
    }

    res.json(pendingPans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * @desc    Approve or Reject a PAN submission
 * @route   PATCH /api/v1/admin/kyc/pan/:panId
 * @access  Private (Admin)
 */
export const updatePanStatus = async (req: any, res: any) => {
  try {
    const { panId } = req.params;
    const { status } = req.body; // Expecting { "status": "Approved" } or { "status": "Rejected" }

    // 1. Validate the new status
    if (!status || !["Approved", "Rejected"].includes(status)) {
      return res
        .status(400)
        .json({ msg: "Invalid status. Must be 'Approved' or 'Rejected'." });
    }

    // 2. Find and update the Pan document
    const panDoc = await Pan.findById(panId);

    if (!panDoc) {
      return res.status(404).json({ msg: "PAN submission not found" });
    }

    if (panDoc.status === status) {
      return res
        .status(400)
        .json({ msg: `PAN is already ${status}.` });
    }

    // 3. Update the status
    panDoc.status = status;
    await panDoc.save();

    // 4. (Important) If Rejected, remove the link from the User model
    //    so they can resubmit.
    if (status === "Rejected") {
      await User.findOneAndUpdate(
        { _id: panDoc.user },
        { $set: { "kyc.pan": null } }
      );
    }
    
    // If you wanted to delete the rejected Pan document entirely:
    // if (status === "Rejected") {
    //   await panDoc.deleteOne();
    //   return res.json({ success: true, msg: "PAN rejected and submission removed" });
    // }

    res.json({
      success: true,
      msg: `PAN submission ${status.toLowerCase()}`,
      pan: panDoc,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};