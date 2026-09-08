# 5. Alcance

El proyecto comprende el desarrollo de una plataforma SaaS multiinstitucional para centralizar los procesos académicos, estudiantiles, administrativos y financieros de unidades educativas. La solución permitirá que varias instituciones utilicen una misma plataforma, manteniendo separados sus datos y aplicando controles de acceso según el usuario, sus roles, sus permisos, el plan contratado y la vigencia de la suscripción.

La primera versión funcional se concentrará en la plataforma web y en los módulos operativos básicos. La aplicación móvil, las funciones de inteligencia artificial, determinadas integraciones externas y las modalidades de despliegue local o híbrido se incorporarán o evaluarán en fases posteriores, según su prioridad y viabilidad.

## 5.1 Plataforma web

### 5.1.1 Gestión académica

La plataforma web organiza la gestión escolar en módulos relacionados, sin concentrar todo en una sola pantalla.

#### Pedagógica

- **Gestión académica:** gestiones, periodos, niveles y reglas generales del año escolar.
- **Cursos y paralelos:** estructura de grados, cursos, turnos, paralelos, cupos y responsables.
- **Materias:** catálogo de asignaturas, códigos y carga horaria.
- **Asignación docente:** relación de docentes con materias, cursos, paralelos y periodos.
- **Horarios:** distribución de clases y detección de conflictos básicos.
- **Planificación curricular:** contenidos, objetivos, actividades y avance por materia.
- **Asistencia:** registro por estudiante, curso, materia y fecha, con justificaciones.
- **Calificaciones:** actividades evaluativas, notas, ponderaciones y promedios.
- **Evaluaciones académicas asistidas (ampliación posterior):** creación y publicación de pruebas con preguntas objetivas o abiertas, respuestas esperadas, puntajes y rúbricas; registro de intentos y respuestas de los estudiantes; y revisión de resultados antes de incorporarlos a las calificaciones oficiales.
- **Reportes académicos:** consultas de rendimiento, asistencia y consolidación por periodo.

#### Gestión estudiantil

- **Estudiantes:** datos personales, académicos, contacto y tutor responsable, presentados como una ficha integrada.
- **Matrículas:** inscripción del estudiante en una gestión, nivel, curso y paralelo.
- **Retiros y traslados:** cambios de estado con fecha, motivo e historial.

La matrícula podrá generar una obligación económica cuando la institución sea de paga, pero el registro y la confirmación del pago se realizarán en **Finanzas**.

### 5.1.2 Administración

La plataforma contará con tres grupos administrativos diferenciados:

#### Superadministración

- **Planes:** nombre, descripción, costo, moneda, duración, límites, módulos y permisos incluidos.
- **Suscripciones:** institución, plan, fecha de inicio, fecha de vencimiento, estado y renovaciones.
- **Control de acceso SaaS:** validación de vigencia, límites y funciones disponibles para cada institución.

#### Gestión de acceso

- **Usuarios:** cuentas, estado y datos básicos de acceso.
- **Roles:** agrupación de responsabilidades, por ejemplo administrador, docente o cajero.
- **Permisos:** acciones autorizadas por módulo y asignación a roles.

#### Administración institucional

- **Institución:** datos generales, contacto, configuración y parámetros propios.
- **Personal:** docentes, administrativos y sus datos laborales básicos.
- **Ambientes:** aulas, laboratorios, oficinas y capacidad disponible.
- **Calendario institucional:** feriados, actividades, periodos y eventos relevantes.

La administración no reemplaza al área Pedagógica: configura recursos y datos institucionales; Pedagógica organiza cómo se desarrolla la enseñanza.

### 5.1.3 Comunicación y seguimiento

Como ampliación se contempla un centro de avisos institucionales para comunicar eventos, inasistencias, fechas académicas y obligaciones pendientes. Los mensajes deberán enviarse según institución, rol, curso o destinatario, y conservar un estado de entrega o lectura cuando el canal lo permita.

En la primera versión, el seguimiento se cubrirá mediante paneles y reportes. Las notificaciones por correo, aplicación móvil o mensajería externa quedarán sujetas a integración posterior.

### 5.1.4 Inteligencia artificial

Las funciones de inteligencia artificial son una ampliación planificada y no forman parte del núcleo CRUD inicial. Se consideran cuatro aplicaciones:

1. Leer formularios y documentos escaneados con OCR para proponer datos de estudiantes o matrículas.
2. Detectar patrones de inasistencia o bajo rendimiento para generar alertas de apoyo.
3. Evaluar pruebas, generar retroalimentación personalizada e identificar los temas en los que cada estudiante presenta dificultades recurrentes.
4. Ayudar a construir horarios evitando choques de docentes, cursos y ambientes.

En las evaluaciones, las preguntas objetivas podrán calificarse automáticamente mediante una clave de respuestas. Para las preguntas abiertas, la IA propondrá una calificación y una explicación con base en una rúbrica definida por el docente, quien deberá revisarlas antes de registrar la nota oficial. La retroalimentación señalará respuestas incorrectas, explicará los conceptos que deben reforzarse y priorizará los puntos débiles según su frecuencia y repetición en una o varias evaluaciones.

Toda extracción, calificación propuesta o recomendación deberá ser revisada por una persona antes de modificar información oficial. Para procesar lotes de formularios se prevé una cola de trabajos: se cargan varios archivos, se procesan en segundo plano y luego se revisan únicamente los campos dudosos.

## 5.2 Aplicación móvil Flutter

### 5.2.1 Estudiantes

La aplicación móvil para estudiantes se considera una fase posterior. Permitirá consultar horarios, asistencia, calificaciones, calendario y avisos utilizando las mismas credenciales y permisos de la plataforma web.

No se habilitará la modificación directa de notas, asistencia ni matrícula desde el perfil estudiantil.

### 5.2.2 Padres de familia

El módulo móvil para padres o tutores permitirá consultar únicamente la información de los estudiantes vinculados a su cuenta: rendimiento, asistencia, horarios, avisos, conceptos de cobro y pagos registrados.

La relación con el tutor se mantendrá dentro de la ficha del estudiante para evitar un módulo administrativo separado y disperso.

### 5.2.3 Funciones móviles

Las funciones previstas son notificaciones, calendario, consulta de notas y asistencia, estado de cuenta, descarga de comprobantes y acceso rápido mediante biometría del dispositivo. Los pagos por QR o pasarela dependerán de la integración con un proveedor autorizado.

**Estado:** planificado; fuera del primer producto web funcional.

## 5.3 Inteligencia artificial

### 5.3.1 IA académica

Analizará datos históricos de asistencia y calificaciones para identificar estudiantes que requieren seguimiento. Las alertas serán orientativas, explicables y visibles solo para usuarios autorizados; no reemplazarán la evaluación profesional del docente.

También se contempla un módulo de evaluaciones y retroalimentación asistido por IA. El docente podrá preparar una prueba con preguntas, respuestas esperadas, puntajes y rúbricas. Las preguntas objetivas se calificarán automáticamente mediante reglas verificables; en las preguntas abiertas, la IA propondrá un puntaje y su justificación de acuerdo con la rúbrica, pero el docente deberá revisar y aprobar el resultado antes de que se convierta en una calificación oficial.

Después de cada evaluación, el sistema generará una retroalimentación comprensible para el estudiante, indicando los aciertos, los errores, los conceptos que necesita reforzar y recomendaciones de estudio o ejercicios. Los puntos débiles se agruparán por materia, tema o competencia y se ordenarán por prioridad, considerando principalmente la frecuencia con que se repiten los errores, su persistencia en diferentes evaluaciones y su incidencia en el rendimiento. El docente podrá consultar resultados individuales y consolidados del curso para decidir qué contenidos requieren refuerzo.

La retroalimentación no expondrá respuestas ni datos de otros estudiantes. El docente conservará el control sobre las preguntas, las rúbricas, la publicación de resultados y cualquier modificación de la nota.

Su implementación requiere primero datos suficientes, consistentes y autorizados para el análisis.

### 5.3.2 IA administrativa

Podrá proponer horarios y detectar conflictos entre carga docente, cursos, materias y ambientes. También podrá señalar registros financieros o de asistencia atípicos para revisión, sin corregirlos automáticamente.

**Estado:** ampliación posterior a los módulos operativos básicos.

### 5.3.3 IA de reconocimiento

La prioridad será el **reconocimiento de documentos mediante OCR**. El flujo previsto es: carga múltiple de escaneos, extracción en segundo plano, nivel de confianza por campo, revisión humana y confirmación del registro.

El reconocimiento facial para asistencia se mantiene como una posibilidad futura debido a sus requisitos de consentimiento, privacidad, seguridad biométrica, precisión y costo. No será necesario para completar el alcance académico inicial.

## 5.4 Informes y reportes

### 5.4.1 Reportes institucionales

Se contemplan reportes académicos y financieros filtrados por institución y periodo:

- asistencia por estudiante, curso, materia y fecha;
- calificaciones y promedios por periodo;
- resultados de evaluaciones por estudiante, intento, pregunta, tema o competencia, cuando se implemente el módulo de evaluaciones asistidas;
- matrícula, retiros y traslados;
- carga docente y horarios;
- pagos, mensualidades, caja y obligaciones pendientes;
- indicadores generales para el panel administrativo.

La exportación a PDF o Excel se incorporará según la prioridad del sprint y los formatos que valide la institución.

### 5.4.2 Reportes con IA

En una etapa posterior, los datos consolidados podrán utilizarse para generar alertas tempranas, tendencias de rendimiento y resúmenes ejecutivos. También se incluirán reportes de evaluaciones asistidas por IA que muestren aciertos, errores y puntos débiles por estudiante, materia, tema o competencia.

Los puntos débiles se presentarán por prioridad, considerando la frecuencia de los errores, su repetición en distintas evaluaciones y su incidencia en el rendimiento. Estos reportes permitirán al docente reconocer los contenidos con mayor dificultad, planificar actividades de refuerzo y dar seguimiento a la evolución del estudiante o del curso.

Cada resultado deberá indicar los datos y criterios utilizados y presentarse como apoyo a la decisión, no como una decisión automática. Las propuestas de calificación de respuestas abiertas requerirán revisión docente antes de publicarse o registrarse como notas oficiales.

## 5.5 Seguridad y acceso

### 5.5.1 Autenticación y autorización

El acceso web utiliza autenticación mediante JWT. Cada cuenta tendrá un estado y uno o más roles; los roles agruparán permisos específicos para consultar, crear, modificar o eliminar información.

El superadministrador tendrá acceso exclusivo a Planes y Suscripciones. Además de los permisos del usuario, el sistema validará que la institución tenga una suscripción vigente y que el plan incluya el módulo solicitado.

**Estado actual:** inicio y cierre de sesión, usuarios, roles y asignación de permisos ya cuentan con funcionalidad base. La verificación completa de planes y suscripciones está planificada.

### 5.5.2 Seguridad de datos

La solución aplicará hash seguro de contraseñas, HTTPS en producción, validación en frontend y backend, permisos por operación y aislamiento de la información por institución. También se contemplan bitácoras de acciones sensibles, copias de seguridad y procedimientos de restauración.

Los documentos, datos personales y futuros datos biométricos requieren controles reforzados de acceso, conservación y consentimiento. Las copias de respaldo deben probarse periódicamente; no basta con generarlas.

Las preguntas, respuestas, intentos, rúbricas, calificaciones y retroalimentaciones de las evaluaciones también se considerarán información académica protegida. Solo los estudiantes involucrados y el personal autorizado podrán consultarlas; toda aprobación o modificación de una calificación propuesta por IA deberá quedar registrada para su trazabilidad.

## 5.6 Integraciones externas

### 5.6.1 Gubernamentales

Se prevé generar reportes compatibles con los formatos solicitados por autoridades educativas. Una integración directa dependerá de que exista una API oficial, autorización institucional y especificaciones técnicas vigentes.

**Estado:** por investigar y validar; no se asume conexión automática en el alcance inicial.

### 5.6.2 Pagos

El núcleo financiero registrará conceptos de cobro, pagos, mensualidades, movimientos de caja y reportes. Para el prototipo se seleccionó **Stripe Checkout** como integración de tarjetas en modo de prueba. El frontend utiliza la clave pública y Django crea la sesión con la clave secreta, evitando aceptar importes enviados por el navegador.

Una matrícula puede originar un concepto de cobro, pero no se marcará como pagada hasta recibir una confirmación manual autorizada o una respuesta válida de la pasarela.

**Estado:** CRUD persistente de planes y publicación pública implementados. El servicio backend de Stripe incluye creación y registro local de sesiones, consulta de estado y webhook; la contratación desde la interfaz queda pendiente hasta implementar el registro de la institución. Para ejecutar un pago de prueba se deben configurar `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` en el backend. QR y transferencias permanecen planificados.

### 5.6.3 Tecnológicas

Como extensiones se consideran correo electrónico, almacenamiento de documentos, Moodle, Google Classroom y servicios de notificaciones. Cada integración será desacoplada mediante la API para que pueda activarse por plan sin afectar el funcionamiento básico.

## 5.7 Escalabilidad y despliegue

### 5.7.1 Arquitectura SaaS

El sistema seguirá un modelo multiinstitución: una plataforma atenderá a varias unidades educativas y separará sus datos mediante un identificador institucional aplicado en las consultas y reglas de autorización.

El superadministrador creará planes y suscripciones. Cada plan definirá costo, duración, límites y módulos habilitados; cada suscripción relacionará esas condiciones con una institución durante un periodo determinado.

La arquitectura será modular y permitirá escalar por capas: interfaz React, API Django REST y base de datos PostgreSQL.

### 5.7.2 Despliegue híbrido

El despliegue principal será en la nube. Una modalidad local o híbrida podrá evaluarse para instituciones con restricciones de conectividad o políticas propias de resguardo de datos.

La primera versión no implementará sincronización automática entre servidores locales y la nube, porque requiere reglas adicionales para resolver conflictos, operar sin conexión y proteger la información.

## 5.8 Tecnologías core

Tecnologías actualmente utilizadas:

- **Backend:** Python, Django 5.2, Django REST Framework y Simple JWT.
- **Frontend web:** React 19, Vite 8, React Router, Axios, TanStack Query, React Hook Form y Zod.
- **Base de datos de producción:** PostgreSQL mediante Psycopg.
- **Pruebas backend:** Pytest y Pytest-Django.
- **Control de versiones:** Git y GitHub.

Tecnologías planificadas o sujetas a validación:

- **Aplicación móvil:** Flutter.
- **Procesamiento asíncrono/OCR:** servicio de cola y motor de reconocimiento por seleccionar.
- **Despliegue:** proveedor cloud y servicios definitivos por seleccionar.
- **Caché:** Redis solo si las mediciones justifican su uso.
