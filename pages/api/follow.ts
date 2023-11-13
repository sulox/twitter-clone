import { NextApiRequest, NextApiResponse } from "next";

import serverAuth from "@/libs/serverAuth";
import prisma from '@/libs/prismadb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST' && req.method !== 'DELETE') {
        return res.status(405).end();
    }

    try {
        const { userId } = req.body;

        const { currentUser } = await serverAuth(req, res);

        if (!userId || typeof userId !== 'string') {
            throw new Error('Invalid ID');
        }

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        if (!user) {
            throw new Error('Invalid ID');
        }

        //define initial Following IDs
        let updatedFollowingIds = [...(user.followingIds || [])];

        //handle if the request method is POSt
        if (req.method === 'POST') { //if we're adding the Follow we want to update the array of IDs we're following
            updatedFollowingIds.push(userId);
        }
        
        if (req.method === 'DELETE') {
            updatedFollowingIds = updatedFollowingIds.filter((followingId) => followingId !== userId);
        } //we want to go through all IDs we follow and leave only those who are NOT the current userId

        const updatedUser = await prisma.user.update({
            where: {
                id: currentUser.id
            },
            data: {
                followingIds: updatedFollowingIds
            }
        });

        return res.status(200).json(updatedUser);

    } catch (error) {
        console.log(error);
        return res.status(400).end();
    }
}