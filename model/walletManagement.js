const mongoose = require('mongoose')
const {Schema} = mongoose

const TransactionSchema = new Schema({
    amount: {
      type: Number,
    },
    transactionType: {
      type: String,
      enum: ['debit', 'credit'],
    },
    transactionDate: {
      type: Date,
      default: Date.now
    }
  });

  const WalletSchema = new Schema({
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    balance: {
      type: Number,
      required: true,
      default: 0
    },
    transactions: [TransactionSchema]
  });
const walletModel = new mongoose.model("Wallet",WalletSchema)

module.exports = walletModel