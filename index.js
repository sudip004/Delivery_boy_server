const dotenv = require('dotenv')
dotenv.config()
const express = require('express')
const app = express();
const cors = require('cors')
const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");
const { dbConnect } = require('./db');
const PORT = process.env.PORT || 5000

const { deliveryModel } = require("./model/Delivery_boys")
const { orderModel } = require("./model/Orders");
const { default: axios } = require('axios');
const {authMiddleware} = require("./middlewares/Auth")

// middleware
app.use(express.json())
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:3000",
        process.env.RIDER_CLIENT_URL,
        process.env.CLIENT_URL
    ],
    credentials: true
}));

app.use(cookieParser())


// ===========================================
// LOGIN AND SIGNUP START
//========================================

app.post('/delivery-signup', async (req, res) => {
    const { name, email, password, phone, vehicleNumber, isActive, currentLocation, orders } = req.body

    if (!name || !email || !password || !phone || !vehicleNumber) {
        return res.status(400).json({ message: "All fields required" });
    }

    const deliveryBoy = await deliveryModel.create({
        name,
        email,
        phone,
        vehicleNumber,
        password,
    });
    

    res.status(201).json("User Register Successfully")


})


const generateToken = (payload) => {
    return jwt.sign(payload, "sudip", {
        expiresIn: "7d"
    });
};


app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await deliveryModel.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }



        const isMatch = password === user.password;

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = generateToken({
            id: user._id,
            role: "DELIVERY_BOY"
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (err) {
        console.log(err.message);
        
        res.status(500).json({ message: "Server error" });
    }
});

app.get("/api/me", authMiddleware, async (req, res) => {
    try {
        const deliveryBoy = await deliveryModel.findById(req.user.id)
            .select("-password"); 

        if (!deliveryBoy) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Profile fetched successfully",
            user: deliveryBoy
        });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});


//======================================
// DeliveryBoy Side Update
//================================


app.patch("/update-order-boylocation", authMiddleware,async (req, res) => {
    try {
        const { boyId, location } = req.body;

        if (!boyId || !location) {
            return res.status(400).json({ message: "boyId and location required" });
        }

        // 1️⃣ Get delivery boy
        const boy = await deliveryModel.findById(boyId);

        if (!boy || !boy.orders || boy.orders.length === 0) {
            return res.status(404).json({ message: "No active orders found" });
        }

        // 2️⃣ Update all orders in ONE query
        await orderModel.updateMany(
            { _id: { $in: boy.orders } },
            {
                $set: {
                    deliveryBoyLocation: location
                }
            }
        );

        return res.status(200).json({
            message: "Delivery boy location updated for all orders"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// same but not use
app.patch("/update-status-deliveryboy",authMiddleware ,async (req, res) => {
    try {
        const { orderId, orderStatus } = req.body;

        if (!orderId || !orderStatus) {
            return res.status(400).json({
                message: "orderId and orderStatus are required"
            });
        }

        const updatedOrder = await orderModel.findByIdAndUpdate(
            orderId,
            { $set: { orderStatus } },
            { new: true } // return updated document
        );

        if (!updatedOrder) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        return res.status(200).json({
            message: "Order status updated successfully",
            order: updatedOrder
        });

    } catch (error) {
        console.error("Update by delivery boy error:", error.message);
        return res.status(500).json({
            message: "Server error"
        });
    }
});

// Return arry of assing orders
app.get("/assign-orders/:boyId", async (req, res) => {
    try {
        const { boyId } = req.params;

        if (!boyId) {
            return res.status(400).json({ message: "boyId is required" });
        }

        //  Get delivery boy
        const boy = await deliveryModel.findById(boyId);

        if (!boy || !boy.orders || boy.orders.length === 0) {
            return res.status(200).json([]); // no orders
        }

        // 2️⃣ Fetch all orders in ONE query
        const orders = await orderModel.find({
            _id: { $in: boy.orders }
        });

        return res.status(200).json(orders);

    } catch (error) {
        console.error("Fetch assigned orders error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.patch("/boyupdatestatus/:boyId", async (req, res) => {
    try {
        const { boyId } = req.params;
        const { orderId, orderStatus } = req.body;

        if (!boyId || !orderId || !orderStatus) {
            return res.status(400).json({
                message: "boyId, orderId and orderStatus are required"
            });
        }

       
        const order = await orderModel.findByIdAndUpdate(
            orderId,
            { $set: { orderStatus } },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        
        if (orderStatus === "Delivered" || orderStatus === "Cancelled") {
            await deliveryModel.findByIdAndUpdate(
                boyId,
                { $pull: { orders: orderId } } // 👈 auto delete
            );
        }

        return res.status(200).json({
            message: "Order status updated successfully",
            order
        });

    } catch (error) {
        console.error("Delivery boy update error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
});





app.listen(PORT, () => {
    dbConnect()
    console.log("App is running  " + PORT);

})













