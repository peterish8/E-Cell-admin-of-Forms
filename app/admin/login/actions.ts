"use server"

import { cookies } from "next/headers"

// E-Cell Team Admin Credentials
const ADMIN_USERS = {
  "prats8": "pratsecell", // Original admin
  "saahi": "saahi2025",
  "priyanka": "priyanka2025",
  "laksh": "laksh2025",
  "prathick": "prathick2025",
  "manav": "manav2025",
  "krishiv": "krishiv2025",
  "sakshi": "sakshi2025",
  "kulratan": "kulratan2025",
  "sarthak": "sarthak2025",
  "priyanshu": "priyanshu2025"
}

export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  if (ADMIN_USERS[username as keyof typeof ADMIN_USERS] === password) {
    // Set cookie on server side
    const cookieStore = await cookies()
    cookieStore.set("admin_authenticated", "true", {
      path: "/",
      maxAge: 86400, // 24 hours
      httpOnly: false, // Allow client-side access if needed
      sameSite: "lax",
    })

    return { success: true }
  } else {
    return { error: "Invalid username or password" }
  }
}
