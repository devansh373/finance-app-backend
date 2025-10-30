import { Response } from "express";
// import Transaction from "../models/Transaction";
import {User} from "../models/User";
import Product from "../models/Product";
import { PrismaClient, TransactionType } from "@prisma/client";


// export const buyProduct = async (req: any, res: Response) => {
//   try {
//     const { productId, units } = req.body;
//     const user = await User.findById(req.user.id);
//     const product = await Product.findById(productId);

//     if (!user || !product) return res.status(404).json({ msg: "User/Product not found" });

//     const totalAmount = product.price * units;

//     if (user.wallet < totalAmount) {
//       return res.status(400).json({ msg: "Insufficient balance" });
//     }

    
//     user.wallet -= totalAmount;
//     await user.save();

    
//     const txn = new Transaction({
//       userId: user._id,
//       productId,
//       units,
//       priceAtTxn: product.price,
//       totalAmount,
//       type: "BUY",
//     });
//     await txn.save();

//     res.json({ msg: "Purchase successful", txn });
//   } catch (err) {
//     res.status(500).json({ msg: "Error buying product" });
//   }
// };




const prisma = new PrismaClient();

export const buyProduct = async (req: any, res: Response) => {
  try {
    const { productId, units } = req.body;

    // 1️⃣ Fetch user and product from MongoDB
    const user = await User.findById(req.user.id);
    const product = await Product.findById(productId);

    if (!user || !product)
      return res.status(404).json({ msg: "User/Product not found" });

    const totalAmount = product.price * units;

    // 2️⃣ Get or create SQL wallet for this user
    let wallet = await prisma.wallet.findFirst({
      where: { userId: user._id?.toString() },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: user._id?.toString()!,
          balance: 100000,
        },
      });
    }

    // 3️⃣ Check balance
    const walletBalance = Number(wallet.balance);
    if (walletBalance < totalAmount) {
      return res.status(400).json({ msg: "Insufficient balance" });
    }

    // 4️⃣ Use Prisma transaction (ensures atomicity)
    const [updatedWallet, transaction] = await prisma.$transaction([
      prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            decrement: totalAmount,
          },
        },
      }),
      prisma.transaction.create({
        data: {
          walletId: wallet.id,
          amount: totalAmount,
          type: TransactionType.CREDIT,
          meta: {
            productId,
            units,
            priceAtTxn: product.price,
          },
          userId:user._id?.toString()!
        },
      }),
    ]);

    return res.json({
      msg: "Purchase successful",
      wallet: updatedWallet,
      transaction,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error buying product" });
  }
};



// export const getPortfolio = async (req: any, res: Response) => {
//   try {
//     const txns = await Transaction.find({ userId: req.user.id }).populate("productId");

//     let invested = 0;
//     let currentValue = 0;

//     txns.forEach((txn) => {
//       invested += txn.totalAmount;
//       currentValue += txn.units * (txn.productId as any).price;
//     });

//     const returns = currentValue - invested;

//     res.json({ invested, currentValue, returns, transactions: txns });
//   } catch (err) {
//     res.status(500).json({ msg: "Error fetching portfolio" });
//   }
// };


export const getPortfolio = async (req: any, res: Response) => {
  try {
    // 1️⃣ Get the user's SQL wallet
    const wallet = await prisma.wallet.findFirst({
      where: { userId: req.user.id },
    });

    if (!wallet) {
      // No wallet means no transactions
      return res.json({ invested: 0, currentValue: 0, returns: 0, transactions: [] });
    }

    // 2️⃣ Get all purchase transactions from SQL
    const txns = await prisma.transaction.findMany({
      where: {
        walletId: wallet.id,
        type: TransactionType.CREDIT, // Assuming CREDIT = Purchase (as in buyProduct)
      },
    });

    if (txns.length === 0) {
      return res.json({ invested: 0, currentValue: 0, returns: 0, transactions: [] });
    }

    // 3️⃣ Get unique product IDs from the transactions' meta data
    const productIds = [
      ...new Set(txns.map((txn: any) => (txn.meta as any).productId)),
    ];

    // 4️⃣ Fetch all corresponding products from MongoDB for current prices
    const products = await Product.find({ _id: { $in: productIds } });

    // 5️⃣ Create a map of current prices for easy lookup
    const productPriceMap = new Map<string, number>();
    products.forEach((product:any) => {
      productPriceMap.set(product._id.toString(), product.price);
    });

    let invested = 0;
    let currentValue = 0;
    const populatedTxns: any[] = []; // To send back to client

    // 6️⃣ Calculate total invested and current value
    txns.forEach((txn: any) => {
      const meta = txn.meta as any;
      
      // Get current price, fallback to purchase price if product was deleted
      const currentPrice = productPriceMap.get(meta.productId) || meta.priceAtTxn;

      invested += Number(txn.amount); // `amount` is the total cost at purchase
      currentValue += meta.units * currentPrice;

      // Build a "populated" transaction object to return
      populatedTxns.push({
        ...txn,
        // Mimic the original populate behavior
        product: { 
          _id: meta.productId,
          price: currentPrice,
          name: products.find((p:any) => p._id.toString() === meta.productId)?.name || "Unknown Product"
        }
      });
    });

    const returns = currentValue - invested;

    res.json({ invested, currentValue, returns, transactions: populatedTxns });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ msg: err.message || "Error fetching portfolio" });
  }
};


export const getWatchlist = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).populate("watchlist");
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json(user.watchlist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching watchlist" });
  }
};

export const addToWatchlist = async (req: any, res: Response) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ msg: "User not found" });

    if (!user.watchlist.includes(productId)) {
      user.watchlist.push(productId);
      await user.save();
    }

    res.json({ msg: "Added to watchlist", watchlist: user.watchlist });
  } catch (err) {
    res.status(500).json({ msg: "Error updating watchlist" });
  }
};

export const removeFromWatchlist = async (req: any, res: Response) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ msg: "User not found" });

    user.watchlist = user.watchlist.filter((id: any) => id.toString() !== productId);
    await user.save();

    res.json({ msg: "Removed from watchlist", watchlist: user.watchlist });
  } catch (err) {
    res.status(500).json({ msg: "Error updating watchlist" });
  }
};
