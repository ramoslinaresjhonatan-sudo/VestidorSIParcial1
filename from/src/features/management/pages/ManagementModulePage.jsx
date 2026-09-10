import {
  ArrowLeftRight,
  Banknote,
  BarChart3,
  Building2,
  CalendarDays,
  CreditCard,
  Crown,
  GraduationCap,
  School,
  Tag,
  UserRound,
} from 'lucide-react'
import { ModuleOverview } from '@/components/shared/ModuleOverview/ModuleOverview'

const modules = {
  plans: {
    area: 'Superadministración',
    badge: 'Solo Super Administrador',
    title: 'Planes',
    description: 'Crea los planes comerciales que determinan el costo, vigencia y alcance del sistema.',
    icon: Crown,
    fields: ['Nombre y código', 'Costo y moneda', 'Duración y periodo de prueba', 'Módulos y permisos incluidos', 'Límites y estado'],
  },
  subscriptions: {
    area: 'Superadministración',
    badge: 'Solo Super Administrador',
    title: 'Suscripciones',
    description: 'Asigna un plan a una institución y controla durante cuánto tiempo puede acceder al sistema.',
    icon: CreditCard,
    fields: ['Institución y administrador', 'Plan asignado', 'Inicio y vencimiento', 'Pago y estado', 'Renovación o suspensión'],
  },
  institution: {
    area: 'Administración',
    badge: 'Módulo administrativo',
    title: 'Institución',
    description: 'Centraliza la información general y legal de la unidad educativa.',
    icon: Building2,
    fields: ['Datos generales', 'Dirección y contacto', 'Director responsable', 'Logotipo', 'Documentos institucionales'],
  },
  staff: {
    area: 'Administración',
    badge: 'Módulo administrativo',
    title: 'Personal',
    description: 'Administra los datos laborales de docentes y personal administrativo.',
    icon: UserRound,
    fields: ['Datos personales', 'Cargo', 'Especialidad', 'Información de contacto', 'Estado laboral'],
  },
  facilities: {
    area: 'Administración',
    badge: 'Módulo administrativo',
    title: 'Ambientes',
    description: 'Registra las aulas físicas y demás espacios disponibles en la institución.',
    icon: School,
    fields: ['Código y nombre', 'Tipo de ambiente', 'Ubicación', 'Capacidad', 'Disponibilidad'],
  },
  institutionalCalendar: {
    area: 'Administración',
    badge: 'Módulo administrativo',
    title: 'Calendario institucional',
    description: 'Organiza feriados, reuniones, actos y actividades institucionales.',
    icon: CalendarDays,
    fields: ['Actividad', 'Tipo de evento', 'Fecha y hora', 'Responsable', 'Observaciones'],
  },
  students: {
    area: 'Gestión estudiantil',
    badge: 'Módulo estudiantil',
    title: 'Estudiantes',
    description: 'Mantiene el registro principal del estudiante y toda su información relacionada.',
    icon: GraduationCap,
    fields: ['Datos personales', 'Padres o tutores', 'Documentos e historial', 'Contacto de emergencia', 'Escaneo de formularios con IA'],
  },
  enrollments: {
    area: 'Gestión estudiantil',
    badge: 'Módulo estudiantil',
    title: 'Matrículas',
    description: 'Registra la inscripción del estudiante en una gestión, curso y paralelo.',
    icon: GraduationCap,
    fields: ['Estudiante', 'Gestión académica', 'Curso y paralelo', 'Fecha de matrícula', 'Estado de inscripción'],
  },
  withdrawalsTransfers: {
    area: 'Gestión estudiantil',
    badge: 'Módulo estudiantil',
    title: 'Retiros y traslados',
    description: 'Controla la salida o traslado de estudiantes sin eliminar su historial.',
    icon: ArrowLeftRight,
    fields: ['Estudiante', 'Tipo de movimiento', 'Fecha', 'Motivo', 'Institución de destino'],
  },
  paymentConcepts: {
    area: 'Finanzas',
    badge: 'Módulo financiero',
    title: 'Conceptos de cobro',
    description: 'Configura los conceptos e importes que pueden cobrarse a los estudiantes.',
    icon: Tag,
    fields: ['Código y concepto', 'Importe', 'Periodicidad', 'Descuentos permitidos', 'Estado'],
  },
  payments: {
    area: 'Finanzas',
    badge: 'Módulo financiero',
    title: 'Pagos',
    description: 'Registra los cobros realizados y genera sus respectivos comprobantes.',
    icon: CreditCard,
    fields: ['Estudiante', 'Concepto', 'Importe', 'Método de pago', 'Comprobante'],
  },
  monthlyFees: {
    area: 'Finanzas',
    badge: 'Módulo financiero',
    title: 'Mensualidades',
    description: 'Gestiona las cuotas mensuales, vencimientos y saldos pendientes.',
    icon: CalendarDays,
    fields: ['Estudiante', 'Periodo', 'Fecha de vencimiento', 'Importe y descuento', 'Saldo y estado'],
  },
  cashRegister: {
    area: 'Finanzas',
    badge: 'Módulo financiero',
    title: 'Caja',
    description: 'Controla la apertura, movimientos y cierre diario de caja.',
    icon: Banknote,
    fields: ['Responsable', 'Apertura', 'Ingresos', 'Anulaciones', 'Cierre y diferencia'],
  },
  financialReports: {
    area: 'Finanzas',
    badge: 'Módulo financiero',
    title: 'Reportes financieros',
    description: 'Consulta ingresos, deudas y movimientos mediante filtros consolidados.',
    icon: BarChart3,
    fields: ['Rango de fechas', 'Concepto', 'Curso o estudiante', 'Estado de pago', 'Formato de reporte'],
  },
}

export function ManagementModulePage({ moduleKey }) {
  const module = modules[moduleKey]

  return (
    <ModuleOverview
      eyebrow={module.area}
      badgeLabel={module.badge}
      title={module.title}
      description={module.description}
      icon={module.icon}
      fields={module.fields}
    />
  )
}
