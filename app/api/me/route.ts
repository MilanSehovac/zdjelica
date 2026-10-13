import { NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/lib/session";
import { listFavorites } from "@/lib/favorites";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  const headers = { "Cache-Control": "no-store" };
  if (!user) return NextResponse.json({ user: null, favorites: [] }, { headers });
  return NextResponse.json(
    {
      user: { name: user.name, email: user.email, isAdmin: isAdmin(user) },
      favorites: listFavorites(user.id).map((f) => f.productSlug),
    },
    { headers },
  );
}
