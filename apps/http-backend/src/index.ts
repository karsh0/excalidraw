import express from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware";
import { CreateRoomSchema, CreateUserSchema, SignSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import bcrypt from "bcrypt"
const app = express();

app.use(express.json())

app.post('/signup', async(req,res)=>{
    const parsedData = CreateUserSchema.safeParse(req.body);
    if(!parsedData.success){
        res.json({
            message:"Invalid format"
        })
        return;
    }
    try{
        const hashedPassword = await bcrypt.hash(parsedData.data.password, 3)
        const user = await prismaClient.user.create({
            data:{
                email: parsedData.data.email,
                name: parsedData.data.name,
                password: hashedPassword
            }
        })
        res.json({
            userId: user.id
        })
        
    }catch(e){
        res.status(411).json({
            message:"user already exists"
        })
    }
   
})

app.post('/signin', async (req,res)=>{
    const parsedData = SignSchema.safeParse(req.body);

    try{
        const user = await prismaClient.user.findFirst({
                where: {
                    email: parsedData.data?.email
                }
            })
            
        if(!user){
            res.status(401).json({
                message:"user not found"
            })
            return;
        }
        const passwordMatch = bcrypt.compare(parsedData.data?.password ?? "", user.password)

        if(!user || !passwordMatch){
            res.status(403).json({
                message:"Invalid credientials"
            })
        }

        const token = jwt.sign({userId: user.id}, JWT_SECRET);

        res.json({
            message: "signin success",
            token
        })
    }catch(e){
        res.json({
            message:"error in sigin"
        })
    }

})

app.post('/room', middleware, async(req,res)=>{
    const parsedData = CreateRoomSchema.safeParse(req.body)
    if(!parsedData.success){
        res.json({
            message:"Invalid format"
        })
        return;
    }
    try{

        const room = await prismaClient.room.create({
            data:{
                slug: parsedData.data.name,
                adminId: req.userId
            }
        })
        res.json({
            roomId: room.id
        })
    }catch(e){
        res.json({
            message:"Slug already exists"
        })
    }
})

app.get('/chat/:roomId', async(req,res)=>{
    const roomId = Number(req.params.roomId);
    try{

        const messages = await prismaClient.chat.findMany({
            where:{
                roomId
            },
            orderBy: {id: 'desc'},
            take: 50
            
        })
        res.json({
            messages
        })
    }catch(e){
        res.json({
            message:"error in chat route"
        })
    }
})

app.get('/room/:slug', async(req,res)=>{
    const slug = req.params.slug;
    try{

        const room = await prismaClient.room.findFirst({where:{
            slug
        }})
        res.json({
            roomId: room?.id
        })
    }catch(e){
        console.log(e)
    }
})


app.listen(3001)