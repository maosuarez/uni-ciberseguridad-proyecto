export async function handleSubmitImage(file: File | null) {
  if (!file) {
    throw new Error("No se seleccionó ningún archivo.")
  }

  // Validar tipo
  const validTypes = ["image/jpeg", "image/png", "image/webp"]
  if (!validTypes.includes(file.type)) {
    throw new Error("Formato no permitido (solo JPG, PNG o WEBP).")
  }

  // Validar tamaño
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("El archivo es demasiado grande (máx 5 MB).")
  }

  // ✅ Crear el formData
  const formData = new FormData()
  formData.append("file", file)

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(`Error: ${data.error || "Error desconocido"}`)
    }

    return data.imageRecord.path
    
  } catch (error) {
    throw new Error("Error al subir la imagen." + error)
  }
}

