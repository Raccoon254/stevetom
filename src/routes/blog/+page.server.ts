import { fail } from '@sveltejs/kit';
import { prisma } from '$lib/db';
import type { Actions } from './$types';

export const actions: Actions = {
    subscribe: async ({ request }) => {
        const data = await request.formData();
        const email = data.get('email');

        if (!email || typeof email !== 'string') {
            return fail(400, { email, missing: true });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
             return fail(400, { email, invalid: true });
        }

        try {
            await prisma.newsletterSubscriber.create({
                data: {
                    email,
                },
            });
            return { success: true };
        } catch (error) {
             // Check for unique constraint violation (P2002)
             if ((error as any).code === 'P2002') {
                 // Already subscribed
                  return { success: true, message: 'You are already subscribed!' };
             }
            console.error('Newsletter subscription error:', error);
            return fail(500, { message: 'Internal Server Error' });
        }
    }
};
