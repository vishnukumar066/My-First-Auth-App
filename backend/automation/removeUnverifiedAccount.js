import cron from "node-cron";
import { User } from "../models/userModel.js";
import { CallPage } from "twilio/lib/rest/api/v2010/account/call.js";

export const removeUnverifiedAccounts = () => {
    cron.schedule("*/30 * * * *", async () => {
        
        try {
            const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
            const userToDelete = await User.deleteMany({
                accountVerified: false,
                createdAt: { $lt: thirtyMinutesAgo },
            });
            console.log(userToDelete);
        } catch (error) {
            console.error("Error removing unverified accounts: ", error);
        }
    });
}