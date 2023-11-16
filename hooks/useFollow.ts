import { useCallback, useMemo } from "react";

import useCurrentUser from "./useCurrentUser"
import useLoginModal from "./useLoginModal";
import useUser from "./useUser";
import toast from "react-hot-toast";
import axios from "axios";

const useFollow = (userId: string) => {
    const { data: currentUser, mutate: mutateCurrentUser } = useCurrentUser();
    const { mutate: mutateFetchedUser } = useUser(userId);

    const loginModal = useLoginModal();

    const isFollowing = useMemo(() => {
        const list = currentUser?.followingIds || [];

        return list.includes(userId);
    }, [currentUser?.followingIds, userId]);

    const toggleFollow = useCallback(async () => {
        if (!currentUser) {
            return loginModal.onOpen();
        }

       try {
            let request;
        //identify whether we already follow the user, and thus if want to follow/unfollow
            if (isFollowing) {
                request = () => axios.delete('/api/follow', { data: { userId } });
                //request = () => axios.delete(`/api/follow?userId=${userId}`);
            } else {
                request = () => axios.post('/api/follow', { userId });
                //request = () => axios.post(`/api/follow?userId=${userId}`);
            }

            await request();

            mutateCurrentUser();
            mutateFetchedUser();

            toast.success('Success');
       } catch (error) {
            //console.log(error);
            //return res.status(400).end();
            toast.error('Something went wrong');
       }
    }, [currentUser, isFollowing, userId, mutateCurrentUser, mutateFetchedUser, loginModal]);

    return {isFollowing, toggleFollow};
}

export default useFollow;