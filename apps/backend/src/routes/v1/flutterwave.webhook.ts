// const flutterwaveWebhook = async (req: Request, res: Response): Promise<void> => {
//   const secretHash = process.env.FLW_SECRET_HASH;

//   if (req.headers["verif-hash"] !== secretHash) {
//     return res.status(401).end();
//   }

//   const payload = req.body;

//   if (payload.event === "charge.completed") {
//     const tx_ref = payload.data.tx_ref;

//     const transaction = await Transaction.findOne({
//       paymentReference: tx_ref,
//     });

//     if (transaction) {
//       transaction.status = "Completed";
//       transaction.resultInfo = {
//         resultStatus: "SUCCESS",
//         resultCode: "00",
//         resultMsg: "Flutterwave payment successful",
//       };
//       await transaction.save();

//       // 👉 Enroll user (same logic you already have)
//     }
//   }

//   res.status(200).end();
// };