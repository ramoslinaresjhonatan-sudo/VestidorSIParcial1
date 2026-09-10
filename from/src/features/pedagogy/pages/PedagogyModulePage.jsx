import {
  BarChart3,
  BookOpen,
  CalendarClock,
  ClipboardCheck,
  FileText,
  School,
  Settings2,
  UserCheck,
  UsersRound,
} from 'lucide-react'
import { ModuleOverview } from '@/components/shared/ModuleOverview/ModuleOverview'

const modules = {
  academicManagement: {
    title: 'Gestión académica',
    description: 'Configura las reglas y periodos que utilizarán los demás módulos pedagógicos.',
    icon: Settings2,
    fields: ['Gestiones y periodos', 'Niveles y grados', 'Turnos', 'Bloques horarios', 'Escala de calificaciones'],
  },
  courses: {
    title: 'Cursos y paralelos',
    description: 'Organiza los grados, paralelos, turnos y docentes tutores de cada gestión académica.',
    icon: School,
    fields: ['Gestión académica', 'Nivel y grado', 'Paralelo y turno', 'Docente tutor', 'Capacidad y estado'],
  },
  subjects: {
    title: 'Materias',
    description: 'Administra el catálogo de materias y su distribución por niveles y grados.',
    icon: BookOpen,
    fields: ['Código y nombre', 'Área curricular', 'Nivel y grados', 'Horas semanales', 'Estado'],
  },
  teacherAssignments: {
    title: 'Asignación docente',
    description: 'Relaciona a cada docente con las materias y cursos que tendrá a su cargo.',
    icon: UsersRound,
    fields: ['Gestión académica', 'Docente', 'Curso y paralelo', 'Materia', 'Carga horaria'],
  },
  schedules: {
    title: 'Horarios',
    description: 'Distribuye materias, docentes y aulas por día y bloque horario.',
    icon: CalendarClock,
    fields: ['Curso y paralelo', 'Día y bloque', 'Hora de inicio y fin', 'Materia y docente', 'Aula física'],
  },
  curriculumPlanning: {
    title: 'Planificación curricular',
    description: 'Centraliza las unidades, contenidos y actividades planificadas por materia.',
    icon: FileText,
    fields: ['Periodo académico', 'Curso y materia', 'Objetivos y contenidos', 'Actividades y recursos', 'Criterios de evaluación'],
  },
  attendance: {
    title: 'Asistencia',
    description: 'Registra y consulta la asistencia diaria de los estudiantes.',
    icon: UserCheck,
    fields: ['Fecha', 'Curso y materia', 'Estudiante', 'Estado de asistencia', 'Justificación'],
  },
  grades: {
    title: 'Calificaciones',
    description: 'Registra las calificaciones obtenidas por los estudiantes en cada periodo académico.',
    icon: ClipboardCheck,
    fields: ['Periodo académico', 'Curso y materia', 'Estudiante', 'Calificación', 'Observaciones'],
  },
  academicReports: {
    title: 'Reportes académicos',
    description: 'Consulta el rendimiento académico mediante filtros y reportes consolidados.',
    icon: BarChart3,
    fields: ['Gestión y periodo', 'Nivel y curso', 'Materia y docente', 'Estudiante', 'Tipo de reporte'],
  },
}

export function PedagogyModulePage({ moduleKey }) {
  const module = modules[moduleKey]

  return (
    <ModuleOverview
      eyebrow="Gestión pedagógica"
      badgeLabel="Módulo pedagógico"
      {...module}
    />
  )
}
