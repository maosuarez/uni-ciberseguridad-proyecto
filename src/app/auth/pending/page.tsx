import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Mail } from "lucide-react"
import Link from "next/link"

export default async function PendingApprovalPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  if (session.user.status === "approved") {
    redirect("/")
  }

  if (session.user.status === "rejected") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Solicitud Rechazada</CardTitle>
            <CardDescription>Tu solicitud de registro ha sido rechazada por un administrador.</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Si crees que esto es un error, por favor contacta con soporte.
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/login">Volver al inicio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-amber-600 animate-pulse" />
          </div>
          <CardTitle className="text-2xl">Cuenta Pendiente de Aprobación</CardTitle>
          <CardDescription>Tu cuenta ha sido creada exitosamente y está en lista de espera.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-900">
              Un administrador revisará tu solicitud pronto. Recibirás un correo electrónico cuando tu cuenta sea
              aprobada.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Mientras tanto:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Revisa tu correo electrónico regularmente</li>
              <li>Asegúrate de que tu información sea correcta</li>
              <li>Recibirás un cupón de bienvenida al ser aprobado</li>
            </ul>
          </div>
          <Button asChild variant="outline" className="w-full bg-transparent">
            <Link href="/auth/login">Cerrar sesión</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
