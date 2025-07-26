import type { DiscordUser, ListingStatus, ListingType } from '@/queries/api/shopkeeperSchemas';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface State {
    user: DiscordUser;
    setUser: (user: DiscordUser) => void;
}

export const useStore = create<State>()(
    devtools((set) => ({
        user: { id: '', username: '', is_owner: false },
        setUser: (user) => set({ user }),
    })),
);

export const defaultQueryParams = {
    status: ['open'] as ListingStatus[],
    type: ['buy', 'sell'] as ListingType[],
    owner: [] as string[],
};
