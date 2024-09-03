import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createUser, deleteUser, updateUser } from '@/lib/actions/user.actions'
import { clerkClient } from '@clerk/clerk-sdk-node'
import { NextResponse } from 'next/server'
import User from '@/lib/database/models/user.model'
 
export async function POST(req: Request) {
 
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
 
  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }
 
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");
 
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }
 
  const payload = await req.json();
  const body = JSON.stringify(payload);
 
  const wh = new Webhook(WEBHOOK_SECRET);
 
  let evt: WebhookEvent;
 
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }
 
  const { id } = evt.data;
  const eventType = evt.type;

  // Ensure `id` is defined before proceeding
  if (!id) {
    return new Response('Error: id is undefined', { status: 400 });
  }
 
  if (eventType === 'user.created') {
    const { email_addresses, image_url, first_name, last_name, username } = evt.data;

    const user = {
      clerkId: id,
      email: email_addresses[0].email_address,
      username: username!,
      firstName: first_name ?? '', // Provide a default empty string if null
      lastName: last_name ?? '',   // Provide a default empty string if null
      photo: image_url,
    };
    
    const newUser = await createUser(user);

    if (newUser) {
      await clerkClient.users.updateUserMetadata(id, {
        publicMetadata: {
          userId: newUser._id
        }
      });
    }

    return NextResponse.json({ message: 'OK', user: newUser });
  }

  if (eventType === 'user.updated') {
    const { image_url, first_name, last_name, username } = evt.data;

    // Ensure `first_name`, `last_name`, and `username` are strings
    const user = {
      firstName: first_name ?? '', // Provide a default empty string if null
      lastName: last_name ?? '',   // Provide a default empty string if null
      username: username ?? '',    // Provide a default empty string if null
      photo: image_url,
    };

    const updatedUser = await updateUser(id, user);

    return NextResponse.json({ message: 'OK', user: updatedUser });
  }

  if (eventType === 'user.deleted') {
    const deletedUser = await deleteUser(id);

    return NextResponse.json({ message: 'OK', user: deletedUser });
  }
 
  return new Response('', { status: 200 });
}
