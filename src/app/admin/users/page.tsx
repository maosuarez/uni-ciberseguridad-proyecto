import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { UserManagementTable } from "@/components/user-management-table"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function UsersManagementPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    redirect("/")
  }

  const users = await prisma.profile.findMany({
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      full_name: true,
      email: true,
      role: true,
      status: true,
      created_at: true,
      avatar_url: true,
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-balance">Gestión de Usuarios</h1>
            <p className="text-muted-foreground mt-2">Aprobar, rechazar o gestionar usuarios registrados</p>
          </div>
        </div>

        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="text-2xl text-amber-900">Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <UserManagementTable users={users} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
