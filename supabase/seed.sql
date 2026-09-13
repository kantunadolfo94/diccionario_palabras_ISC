-- ============================================================
-- SysDictionary - Seed Data
-- Ejecutar DESPUÉS de schema.sql
-- ============================================================

-- ============================================================
-- CATEGORIES
-- ============================================================
INSERT INTO public.categories (id, name, description, icon, color, accent, sort_order) VALUES
  ('cat-prog-0001-0000-000000000001', 'Programación',          'Lenguajes, algoritmos y paradigmas de programación',                    'Code',          '#6366F1', '#818CF8', 1),
  ('cat-db00-0001-0000-000000000002', 'Bases de datos',         'Sistemas de gestión, modelado y consulta de datos',                     'Database',      '#0EA5E9', '#38BDF8', 2),
  ('cat-web0-0001-0000-000000000003', 'Desarrollo web',         'Frontend, backend y tecnologías para la web',                           'Globe',         '#10B981', '#34D399', 3),
  ('cat-net0-0001-0000-000000000004', 'Redes',                  'Infraestructura de redes, protocolos y comunicaciones',                  'Network',       '#F59E0B', '#FCD34D', 4),
  ('cat-sec0-0001-0000-000000000005', 'Ciberseguridad',         'Protección de sistemas, datos e infraestructura digital',               'Shield',        '#EF4444', '#F87171', 5),
  ('cat-cld0-0001-0000-000000000006', 'Cloud',                  'Computación en la nube, servicios y arquitecturas cloud',               'Cloud',         '#0EA5E9', '#38BDF8', 6),
  ('cat-sys0-0001-0000-000000000007', 'Sistemas',               'Sistemas operativos, arquitectura de computadoras y hardware',          'Cpu',           '#8B5CF6', '#A78BFA', 7),
  ('cat-dop0-0001-0000-000000000008', 'DevOps',                 'Integración continua, entrega continua y automatización',               'GitBranch',     '#F97316', '#FB923C', 8),
  ('cat-swd0-0001-0000-000000000009', 'Desarrollo de software', 'Metodologías, patrones y procesos de ingeniería de software',          'Layers',        '#14B8A6', '#2DD4BF', 9),
  ('cat-dat0-0001-0000-000000000010', 'Datos',                  'Análisis de datos, ciencia de datos y visualización',                   'BarChart2',     '#EC4899', '#F472B6', 10),
  ('cat-ai00-0001-0000-000000000011', 'Inteligencia Artificial', 'Machine learning, deep learning y aplicaciones de IA',                'Brain',         '#8B5CF6', '#A78BFA', 11),
  ('cat-oth0-0001-0000-000000000012', 'Otras',                  'Términos generales y misceláneos de ingeniería en sistemas',            'MoreHorizontal','#64748B', '#94A3B8', 12)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- TERMS
-- ============================================================
INSERT INTO public.terms (id, english_word, spanish_word, definition, technical_definition, example, category_id, status) VALUES

-- PROGRAMACIÓN
('trm-001-prog-0000-000000000001', 'Algorithm', 'Algoritmo',
 'Conjunto ordenado de instrucciones finitas que resuelven un problema o realizan una tarea.',
 'Secuencia de pasos computacionales que transforma una entrada en una salida, caracterizada por su finitud, precisión y efectividad.',
 'El algoritmo de ordenamiento QuickSort divide el arreglo en particiones para ordenarlos eficientemente.',
 'cat-prog-0001-0000-000000000001', 'published'),

('trm-002-prog-0000-000000000002', 'Variable', 'Variable',
 'Espacio de memoria identificado con un nombre que almacena un valor que puede cambiar durante la ejecución.',
 'Abstracción que asocia un identificador a una dirección de memoria y un tipo de dato específico.',
 'let contador = 0; // Variable que almacena el número de iteraciones',
 'cat-prog-0001-0000-000000000001', 'published'),

('trm-003-prog-0000-000000000003', 'Function', 'Función',
 'Bloque de código reutilizable que realiza una tarea específica y puede recibir parámetros y devolver un valor.',
 'Unidad de abstracción que encapsula lógica ejecutable, promueve la reutilización y reduce la duplicación de código.',
 'function calcularArea(base, altura) { return base * altura / 2; }',
 'cat-prog-0001-0000-000000000001', 'published'),

('trm-004-prog-0000-000000000004', 'Class', 'Clase',
 'Plantilla o molde que define las propiedades y comportamientos de los objetos en programación orientada a objetos.',
 'Constructor de tipos que agrupa atributos (datos) y métodos (funciones) relacionados bajo un mismo nombre.',
 'class Usuario { constructor(nombre) { this.nombre = nombre; } }',
 'cat-prog-0001-0000-000000000001', 'published'),

('trm-005-prog-0000-000000000005', 'Object', 'Objeto',
 'Instancia concreta de una clase que contiene datos y comportamientos definidos por dicha clase.',
 'Entidad que agrupa estado (atributos) y comportamiento (métodos), siendo la unidad fundamental de la POO.',
 'const usuario = new Usuario("Ana"); // Objeto instanciado de la clase Usuario',
 'cat-prog-0001-0000-000000000001', 'published'),

('trm-006-prog-0000-000000000006', 'Framework', 'Marco de trabajo',
 'Conjunto de herramientas y reglas que facilita el desarrollo de aplicaciones, proporcionando una base común y reutilizable.',
 'Infraestructura de software que provee componentes genéricos reutilizables, estableciendo flujos de control y patrones de diseño predefinidos.',
 'React es un framework de JavaScript para construir interfaces de usuario.',
 'cat-prog-0001-0000-000000000001', 'published'),

-- BASES DE DATOS
('trm-007-db00-0000-000000000007', 'Database', 'Base de datos',
 'Conjunto organizado de información que puede almacenarse, consultarse y modificarse mediante un sistema de gestión de bases de datos (DBMS).',
 'Colección estructurada de datos persistentes gestionados por un DBMS, accesibles mediante lenguajes de consulta como SQL.',
 'MySQL, PostgreSQL y MongoDB son sistemas gestores de bases de datos ampliamente utilizados.',
 'cat-db00-0001-0000-000000000002', 'published'),

('trm-008-db00-0000-000000000008', 'Query', 'Consulta',
 'Solicitud de información específica a una base de datos usando un lenguaje de consulta.',
 'Expresión formal en un lenguaje como SQL que especifica los datos a recuperar, insertar, actualizar o eliminar de una base de datos.',
 'SELECT * FROM usuarios WHERE edad > 18;',
 'cat-db00-0001-0000-000000000002', 'published'),

('trm-009-db00-0000-000000000009', 'Table', 'Tabla',
 'Estructura fundamental de una base de datos relacional que organiza datos en filas y columnas.',
 'Relación bidimensional que representa una entidad del dominio, compuesta por tuplas (filas) y atributos (columnas).',
 'La tabla "clientes" contiene columnas: id, nombre, email, teléfono.',
 'cat-db00-0001-0000-000000000002', 'published'),

('trm-010-db00-0000-000000000010', 'Record', 'Registro',
 'Conjunto de datos relacionados que forman una fila dentro de una tabla de base de datos.',
 'Tupla que representa una instancia concreta de la entidad descrita por la tabla, conteniendo valores para cada atributo.',
 'Un registro en la tabla "productos" contiene: id=1, nombre="Laptop", precio=15000.',
 'cat-db00-0001-0000-000000000002', 'published'),

('trm-011-db00-0000-000000000011', 'SQL', 'SQL',
 'Lenguaje estructurado de consulta para gestionar y manipular bases de datos relacionales.',
 'Lenguaje declarativo estandarizado (ISO/IEC 9075) que incluye DDL, DML, DCL y TCL para administración de datos.',
 'INSERT INTO categorias (nombre) VALUES ("Programación");',
 'cat-db00-0001-0000-000000000002', 'published'),

('trm-012-db00-0000-000000000012', 'Primary Key', 'Clave primaria',
 'Campo o conjunto de campos que identifica de forma única cada registro en una tabla de base de datos.',
 'Restricción de integridad de entidad que garantiza unicidad y no nulidad de una columna o combinación de columnas en una relación.',
 'id INT PRIMARY KEY AUTO_INCREMENT -- Genera identificadores únicos automáticamente',
 'cat-db00-0001-0000-000000000002', 'published'),

-- DESARROLLO WEB
('trm-013-web0-0000-000000000013', 'API', 'Interfaz de programación de aplicaciones',
 'Conjunto de reglas y protocolos que permiten que diferentes aplicaciones se comuniquen entre sí.',
 'Contrato de comunicación entre sistemas que define endpoints, métodos HTTP, formatos de datos y mecanismos de autenticación.',
 'La API de GitHub permite obtener repositorios públicos mediante GET https://api.github.com/repos',
 'cat-web0-0001-0000-000000000003', 'published'),

('trm-014-web0-0000-000000000014', 'Endpoint', 'Punto de acceso',
 'URL específica de una API donde se pueden enviar solicitudes para obtener o enviar datos.',
 'Dirección URL concreta que expone una funcionalidad del sistema, asociada a un método HTTP y una operación de negocio.',
 '/api/v1/usuarios → Endpoint para gestionar usuarios; GET lista, POST crea.',
 'cat-web0-0001-0000-000000000003', 'published'),

('trm-015-web0-0000-000000000015', 'Repository', 'Repositorio',
 'Lugar donde se almacena y gestiona el código fuente de un proyecto, incluyendo su historial de cambios.',
 'Almacén versionado de artefactos de software que preserva el historial completo de modificaciones y facilita la colaboración.',
 'git clone https://github.com/usuario/proyecto.git',
 'cat-web0-0001-0000-000000000003', 'published'),

('trm-016-web0-0000-000000000016', 'Deployment', 'Despliegue',
 'Proceso de publicar una aplicación en un servidor para que sea accesible a los usuarios finales.',
 'Conjunto de actividades que llevan una versión de software desde el entorno de desarrollo hasta producción de forma controlada.',
 'Vercel automatiza el deployment de aplicaciones Next.js desde GitHub.',
 'cat-web0-0001-0000-000000000003', 'published'),

-- REDES
('trm-017-net0-0000-000000000017', 'Protocol', 'Protocolo',
 'Conjunto de reglas que gobiernan la comunicación entre dispositivos en una red.',
 'Estándar formal que define el formato, orden y acciones de los mensajes intercambiados entre entidades de comunicación.',
 'HTTP/HTTPS define cómo navegadores y servidores intercambian datos en la web.',
 'cat-net0-0001-0000-000000000004', 'published'),

('trm-018-net0-0000-000000000018', 'Router', 'Enrutador',
 'Dispositivo de red que dirige el tráfico de datos entre diferentes redes eligiendo la ruta óptima.',
 'Dispositivo de capa 3 (red) del modelo OSI que examina paquetes IP y los reenvía por la interfaz más apropiada según tablas de enrutamiento.',
 'El router doméstico conecta la red local con el ISP, asignando IPs locales mediante DHCP.',
 'cat-net0-0001-0000-000000000004', 'published'),

('trm-019-net0-0000-000000000019', 'Server', 'Servidor',
 'Computadora o programa que provee servicios, recursos o datos a otros dispositivos denominados clientes.',
 'Sistema hardware o software que escucha solicitudes en una dirección y puerto específicos, procesándolas y respondiendo según el protocolo.',
 'Un servidor web Apache escucha en el puerto 80 y sirve páginas HTML a los navegadores.',
 'cat-net0-0001-0000-000000000004', 'published'),

-- CIBERSEGURIDAD
('trm-020-sec0-0000-000000000020', 'Firewall', 'Cortafuegos',
 'Sistema de seguridad que controla el tráfico de red entrante y saliente según reglas de seguridad predefinidas.',
 'Mecanismo de control de acceso que filtra paquetes de red basándose en políticas definidas, actuando como barrera entre redes confiables y no confiables.',
 'iptables -A INPUT -p tcp --dport 22 -j ACCEPT // Permite SSH en el firewall Linux',
 'cat-sec0-0001-0000-000000000005', 'published'),

-- CLOUD
('trm-021-cld0-0000-000000000021', 'Cloud', 'Nube',
 'Modelo de entrega de servicios de computación a través de Internet, incluyendo almacenamiento, procesamiento y software.',
 'Paradigma de computación que ofrece recursos bajo demanda (IaaS, PaaS, SaaS) con escalabilidad elástica y pago por uso.',
 'AWS, Azure y Google Cloud son los principales proveedores de servicios cloud.',
 'cat-cld0-0001-0000-000000000006', 'published'),

-- SISTEMAS
('trm-022-sys0-0000-000000000022', 'Virtual Machine', 'Máquina virtual',
 'Emulación software de un sistema computacional que ejecuta programas como si fuera una computadora física.',
 'Instancia aislada de un sistema operativo invitado que se ejecuta sobre un hipervisor, compartiendo recursos del hardware físico del anfitrión.',
 'VirtualBox permite ejecutar Ubuntu dentro de Windows sin reiniciar el equipo.',
 'cat-sys0-0001-0000-000000000007', 'published'),

('trm-023-sys0-0000-000000000023', 'Operating System', 'Sistema operativo',
 'Software fundamental que gestiona los recursos del hardware y proporciona servicios a los programas de aplicación.',
 'Capa de software que abstrae el hardware, gestiona procesos, memoria, almacenamiento y E/S, e implementa la interfaz de usuario y llamadas al sistema.',
 'Linux, Windows y macOS son sistemas operativos de propósito general ampliamente utilizados.',
 'cat-sys0-0001-0000-000000000007', 'published'),

-- DEVOPS
('trm-024-dop0-0000-000000000024', 'Git', 'Git',
 'Sistema de control de versiones distribuido que registra los cambios en el código fuente durante el desarrollo de software.',
 'VCS distribuido que almacena snapshots del proyecto mediante grafos acíclicos dirigidos (DAG) de commits, facilitando la colaboración y el historial.',
 'git commit -m "feat: agregar módulo de autenticación"',
 'cat-dop0-0001-0000-000000000008', 'published'),

('trm-025-dop0-0000-000000000025', 'Docker', 'Docker',
 'Plataforma para desarrollar, enviar y ejecutar aplicaciones dentro de contenedores ligeros y portables.',
 'Motor de contenedorización que usa namespaces y cgroups de Linux para aislar procesos, garantizando reproducibilidad de entornos.',
 'docker run -p 3000:3000 mi-app:latest // Ejecuta la app en el puerto 3000',
 'cat-dop0-0001-0000-000000000008', 'published')

ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- RELATED TERMS
-- ============================================================
INSERT INTO public.related_terms (term_id, related_term_id) VALUES
  -- Database relacionado con Query, Table, Record, Primary Key, SQL
  ('trm-007-db00-0000-000000000007', 'trm-008-db00-0000-000000000008'),
  ('trm-007-db00-0000-000000000007', 'trm-009-db00-0000-000000000009'),
  ('trm-007-db00-0000-000000000007', 'trm-010-db00-0000-000000000010'),
  ('trm-007-db00-0000-000000000007', 'trm-011-db00-0000-000000000011'),
  ('trm-007-db00-0000-000000000007', 'trm-012-db00-0000-000000000012'),
  -- Query relacionado con Database, SQL, Table
  ('trm-008-db00-0000-000000000008', 'trm-007-db00-0000-000000000007'),
  ('trm-008-db00-0000-000000000008', 'trm-011-db00-0000-000000000011'),
  ('trm-008-db00-0000-000000000008', 'trm-009-db00-0000-000000000009'),
  -- Table relacionado con Database, Record, Primary Key
  ('trm-009-db00-0000-000000000009', 'trm-007-db00-0000-000000000007'),
  ('trm-009-db00-0000-000000000009', 'trm-010-db00-0000-000000000010'),
  ('trm-009-db00-0000-000000000009', 'trm-012-db00-0000-000000000012'),
  -- API relacionado con Endpoint, Server, Protocol
  ('trm-013-web0-0000-000000000013', 'trm-014-web0-0000-000000000014'),
  ('trm-013-web0-0000-000000000013', 'trm-019-net0-0000-000000000019'),
  ('trm-013-web0-0000-000000000013', 'trm-017-net0-0000-000000000017'),
  -- Class relacionado con Object, Function
  ('trm-004-prog-0000-000000000004', 'trm-005-prog-0000-000000000005'),
  ('trm-004-prog-0000-000000000004', 'trm-003-prog-0000-000000000003'),
  -- Object relacionado con Class
  ('trm-005-prog-0000-000000000005', 'trm-004-prog-0000-000000000004'),
  -- Function relacionado con Algorithm, Variable
  ('trm-003-prog-0000-000000000003', 'trm-001-prog-0000-000000000001'),
  ('trm-003-prog-0000-000000000003', 'trm-002-prog-0000-000000000002'),
  -- Git relacionado con Repository, Deployment, Docker
  ('trm-024-dop0-0000-000000000024', 'trm-015-web0-0000-000000000015'),
  ('trm-024-dop0-0000-000000000024', 'trm-016-web0-0000-000000000016'),
  ('trm-024-dop0-0000-000000000024', 'trm-025-dop0-0000-000000000025'),
  -- Docker relacionado con Virtual Machine, Cloud, Git
  ('trm-025-dop0-0000-000000000025', 'trm-022-sys0-0000-000000000022'),
  ('trm-025-dop0-0000-000000000025', 'trm-021-cld0-0000-000000000021'),
  ('trm-025-dop0-0000-000000000025', 'trm-024-dop0-0000-000000000024'),
  -- Router relacionado con Server, Protocol, Firewall
  ('trm-018-net0-0000-000000000018', 'trm-019-net0-0000-000000000019'),
  ('trm-018-net0-0000-000000000018', 'trm-017-net0-0000-000000000017'),
  ('trm-018-net0-0000-000000000018', 'trm-020-sec0-0000-000000000020'),
  -- Framework relacionado con API, Deployment
  ('trm-006-prog-0000-000000000006', 'trm-013-web0-0000-000000000013'),
  ('trm-006-prog-0000-000000000006', 'trm-016-web0-0000-000000000016')
ON CONFLICT (term_id, related_term_id) DO NOTHING;

-- ============================================================
-- DAILY WORD (Framework como palabra del día de hoy)
-- ============================================================
INSERT INTO public.daily_words (term_id, date) VALUES
  ('trm-006-prog-0000-000000000006', CURRENT_DATE)
ON CONFLICT (date) DO NOTHING;
