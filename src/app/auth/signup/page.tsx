"use client"

import type React from "react"

import { registerUser } from "./actions"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { CheckCircle } from "lucide-react"

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)

    try {
      const result = await registerUser(formData)

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(
          result.message ||
            "Cuenta creada exitosamente. Tu solicitud está pendiente de aprobación por un administrador.",
        )
        // Limpiar el formulario
        e.currentTarget.reset()
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al crear la cuenta")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await signIn("google", {
        callbackUrl: "/",
      })
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al registrarse con Google")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-3xl font-bold text-amber-900">Arepabuelas</h1>
            <p className="text-sm text-amber-700">de la esquina</p>
          </div>

          <Card className="border-amber-200">
            <CardHeader>
              <CardTitle className="text-2xl text-amber-900">Crear Cuenta</CardTitle>
              <CardDescription>Regístrate para empezar a disfrutar nuestras arepas</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Juan Pérez"
                      required
                      className="border-amber-200 focus:border-amber-400"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="tu@correo.com"
                      required
                      className="border-amber-200 focus:border-amber-400"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="border-amber-200 focus:border-amber-400"
                    />
                    <p className="text-xs text-muted-foreground">
                      Mínimo 8 caracteres, una mayúscula, una minúscula y un número
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="repeatPassword">Repetir Contraseña</Label>
                    <Input
                      id="repeatPassword"
                      name="repeatPassword"
                      type="password"
                      required
                      className="border-amber-200 focus:border-amber-400"
                    />
                  </div>
                  {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                  {success && (
                    <div className="bg-green-50 border border-green-200 p-4 rounded-md">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-900">¡Registro exitoso!</p>
                          <p className="text-sm text-green-700 mt-1">{success}</p>
                          <p className="text-xs text-green-600 mt-2">
                            Recibirás un cupón de bienvenida una vez que tu cuenta sea aprobada.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={isLoading}>
                    {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-amber-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">O regístrate con</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-amber-200 hover:bg-amber-50 bg-transparent"
                    onClick={handleGoogleSignUp}
                    disabled={isLoading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continuar con Google
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  ¿Ya tienes una cuenta?{" "}
                  <Link href="/auth/login" className="text-amber-600 hover:text-amber-700 underline underline-offset-4">
                    Inicia sesión
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
