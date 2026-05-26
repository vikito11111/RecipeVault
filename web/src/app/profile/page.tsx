import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const [user] = await db.select({
    id: users.id, name: users.name, email: users.email, bio: users.bio, avatarUrl: users.avatarUrl, createdAt: users.createdAt,
  }).from(users).where(eq(users.id, session.userId)).limit(1);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Profile</h1>
      <ProfileForm user={user} />
    </div>
  );
}
