import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, DollarSign, Scale, Users, Star, MapPin, Phone, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";

// Spanish form schema
const spanishFormSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Por favor ingresa un email válido"),
  phoneNumber: z.string().min(10, "El número de teléfono debe tener al menos 10 dígitos"),
  caseType: z.string().min(1, "Por favor selecciona un tipo de caso"),
  caseDescription: z.string().min(50, "La descripción del caso debe tener al menos 50 caracteres"),
  urgencyLevel: z.string().min(1, "Por favor selecciona un nivel de urgencia"),
  budgetRange: z.string().min(1, "Por favor selecciona un rango de presupuesto"),
  location: z.string().min(2, "Por favor ingresa tu ubicación"),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos y condiciones",
  }),
});

type SpanishFormData = z.infer<typeof spanishFormSchema>;

export default function SpanishHome() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<SpanishFormData>({
    resolver: zodResolver(spanishFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      caseType: "",
      caseDescription: "",
      urgencyLevel: "",
      budgetRange: "",
      location: "",
      agreeToTerms: false,
    },
  });

  // Fetch case types in Spanish
  const { data: caseTypesData } = useQuery({
    queryKey: ["/api/case-types", { lang: "es" }],
    queryFn: () => apiRequest("/api/case-types?lang=es"),
  });

  const caseTypes = caseTypesData?.data || [];

  const urgencyLevels = [
    { value: "low", label: "Baja - No hay prisa" },
    { value: "medium", label: "Media - Dentro de 3-6 meses" },
    { value: "high", label: "Alta - Dentro de 1-3 meses" },
    { value: "urgent", label: "Urgente - Dentro de 1 mes" },
  ];

  const budgetRanges = [
    { value: "under-1000", label: "Menos de $1,000" },
    { value: "1000-3000", label: "$1,000 - $3,000" },
    { value: "3000-5000", label: "$3,000 - $5,000" },
    { value: "5000-10000", label: "$5,000 - $10,000" },
    { value: "over-10000", label: "Más de $10,000" },
  ];

  const onSubmit = async (data: SpanishFormData) => {
    setIsSubmitting(true);
    try {
      const response = await apiRequest("/api/legal-requests", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (response.success) {
        toast({
          title: "¡Solicitud enviada exitosamente!",
          description: `Tu número de solicitud es: ${response.data.requestNumber}`,
        });
        form.reset();
        setIsDialogOpen(false);
      } else {
        throw new Error(response.error || "Error al enviar la solicitud");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al enviar la solicitud",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">LinkToLawyers</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#como-funciona" className="text-gray-700 hover:text-blue-600">Cómo funciona</a>
              <a href="#nosotros" className="text-gray-700 hover:text-blue-600">Nosotros</a>
              <a href="#contacto" className="text-gray-700 hover:text-blue-600">Contacto</a>
              <a href="#recursos" className="text-gray-700 hover:text-blue-600">Recursos gratuitos</a>
              <a href="#blog" className="text-gray-700 hover:text-blue-600">Blog</a>
              <a href="#ayuda" className="text-gray-700 hover:text-blue-600">Ayuda</a>
              <a href="/" className="text-gray-700 hover:text-blue-600">English</a>
            </nav>
            <Button variant="outline">Iniciar sesión</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Encuentra Tu Abogado de Inmigración
              </h1>
              <p className="mt-6 text-xl text-gray-600">
                Compara y Negocia Honorarios Legales de Firmas de Abogados a Nivel Nacional
              </p>
              <p className="mt-4 text-lg text-gray-500">
                En LinkToLawyers, conectamos a personas que buscan servicios legales especializados con profesionales que pueden ayudarles usando nuestro Algoritmo de Emparejamiento Inteligente con IA.
              </p>
              <p className="mt-4 text-lg text-gray-500">
                Nuestra plataforma simplifica el proceso de encontrar y conectar con abogados experimentados, asegurando que recibas el mejor apoyo legal adaptado a tu situación única, a un precio accesible.
              </p>
              <p className="mt-4 text-lg text-gray-500">
                Toma control de tus gastos legales hoy. Compara cotizaciones de múltiples abogados, negocia precios justos y toma decisiones informadas sobre tu representación legal. Comienza tu camino hacia servicios legales accesibles ahora.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="bg-black hover:bg-gray-800 text-white">
                      Obtén una Cotización Legal Gratuita
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Obtén una Cotización Legal Gratuita</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nombre</FormLabel>
                                <FormControl>
                                  <Input placeholder="Tu nombre" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Apellido</FormLabel>
                                <FormControl>
                                  <Input placeholder="Tu apellido" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="tu@email.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Número de Teléfono</FormLabel>
                                <FormControl>
                                  <Input placeholder="(555) 123-4567" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="caseType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Caso</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona tu tipo de caso" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {caseTypes.map((caseType: any) => (
                                    <SelectItem key={caseType.value} value={caseType.value}>
                                      {caseType.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="caseDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descripción del Caso</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Describe tu situación legal con el mayor detalle posible..."
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="urgencyLevel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nivel de Urgencia</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecciona urgencia" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {urgencyLevels.map((level) => (
                                      <SelectItem key={level.value} value={level.value}>
                                        {level.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="budgetRange"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Rango de Presupuesto</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecciona presupuesto" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {budgetRanges.map((range) => (
                                      <SelectItem key={range.value} value={range.value}>
                                        {range.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ubicación</FormLabel>
                              <FormControl>
                                <Input placeholder="Ciudad, Estado" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="agreeToTerms"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Acepto los términos y condiciones
                                </FormLabel>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end">
                          <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" size="lg">
                  Rastrea Tu Solicitud
                </Button>
              </div>
            </div>
            <div className="mt-12 lg:mt-0">
              <img
                src="/api/placeholder/600/400"
                alt="Abogado de inmigración ayudando a cliente"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="como-funciona" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Cómo Funciona
            </h2>
            <p className="text-xl text-gray-600">
              Obtén ayuda legal en 3 simples pasos
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Scale className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Describe Tu Caso</h3>
              <p className="text-gray-600">
                Comparte los detalles de tu situación legal y necesidades específicas
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Conecta con Abogados</h3>
              <p className="text-gray-600">
                Nuestro algoritmo te conecta con abogados especializados en tu área
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Compara y Elige</h3>
              <p className="text-gray-600">
                Revisa cotizaciones, compara precios y elige el abogado perfecto para ti
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">LinkToLawyers</h3>
              <p className="text-gray-400">
                Conectando personas con servicios legales de calidad
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Servicios</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Inmigración</li>
                <li>Derecho Familiar</li>
                <li>Derecho Laboral</li>
                <li>Derecho Empresarial</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Recursos</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#blog">Blog</a></li>
                <li><a href="#recursos">Recursos Gratuitos</a></li>
                <li><a href="#ayuda">Centro de Ayuda</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contacto</h4>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>1-800-LAWYERS</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>info@linktolawyers.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Estados Unidos</span>
                </div>
              </div>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="text-center text-gray-400">
            <p>&copy; 2024 LinkToLawyers. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}