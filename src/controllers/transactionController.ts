import { Request, Response } from "express";
import Transaction from "../models/Transaction";
import User from "../models/User";
import Product from "../models/Product";


export const buyProduct = async (req: any, res: Response) => {
  try {
    const { productId, units } = req.body;
    const user = await User.findById(req.user.id);
    const product = await Product.findById(productId);

    if (!user || !product) return res.status(404).json({ msg: "User/Product not found" });

    const totalAmount = product.price * units;

    if (user.wallet < totalAmount) {
      return res.status(400).json({ msg: "Insufficient balance" });
    }

    
    user.wallet -= totalAmount;
    await user.save();

    
    const txn = new Transaction({
      userId: user._id,
      productId,
      units,
      priceAtTxn: product.price,
      totalAmount,
      type: "BUY",
    });
    await txn.save();

    res.json({ msg: "Purchase successful", txn });
  } catch (err) {
    res.status(500).json({ msg: "Error buying product" });
  }
};


export const getPortfolio = async (req: any, res: Response) => {
  try {
    const txns = await Transaction.find({ userId: req.user.id }).populate("productId");

    let invested = 0;
    let currentValue = 0;

    txns.forEach((txn) => {
      invested += txn.totalAmount;
      currentValue += txn.units * (txn.productId as any).price;
    });

    const returns = currentValue - invested;

    res.json({ invested, currentValue, returns, transactions: txns });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching portfolio" });
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
