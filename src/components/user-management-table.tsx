"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, X, Shield, UserIcon } from "lucide-react"
import { approveUser, rejectUser, changeUserRole } from "@/app/actions/users"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Profile } from "@/lib/types"

export function UserManagementTable({ users }: { users: Profile[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleApprove = async (userId: string) => {
    setLoading(userId)
    await approveUser(userId)
    router.refresh()
    setLoading(null)
  }

  const handleReject = async (userId: string) => {
    setLoading(userId)
    await rejectUser(userId)
    router.refresh()
    setLoading(null)
  }

  const handleToggleRole = async (userId: string, currentRole: string) => {
    setLoading(userId)
    const newRole = currentRole === "admin" ? "user" : "admin"
    await changeUserRole(userId, newRole)
    router.refresh()
    setLoading(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Aprobado</Badge>
      case "pending":
        return <Badge className="bg-amber-500">Pendiente</Badge>
      case "rejected":
        return <Badge variant="destructive">Rechazado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Fecha de Registro</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>{user.full_name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{user.full_name || "Sin nombre"}</span>
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{getStatusBadge(user.status)}</TableCell>
              <TableCell>
                <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                  {user.role === "admin" ? <Shield className="w-3 h-3 mr-1" /> : <UserIcon className="w-3 h-3 mr-1" />}
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>{new Date(user.created_at).toLocaleDateString("es-ES")}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {user.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleApprove(user.id)}
                        disabled={loading === user.id}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(user.id)}
                        disabled={loading === user.id}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Rechazar
                      </Button>
                    </>
                  )}
                  {user.status === "approved" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleRole(user.id, user.role)}
                      disabled={loading === user.id}
                    >
                      {user.role === "admin" ? "Quitar Admin" : "Hacer Admin"}
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
