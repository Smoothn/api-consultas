const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
const port = 3000;

// Función para la base de datos
const leerDatos = () => {
    try {
        const datos = fs.readFileSync("./datos.json");
        return JSON.parse(datos);
    } catch (error) {
        console.error("Error al leer la base de datos:", error);
        return { estudiantes: [], profesores: [], tutores: [], admins: [], asistencias: [], eventos: [] };
    }
};

// Función para escribir en la base de datos
const escribirDatos = (datos) => {
    try {
        fs.writeFileSync("./datos.json", JSON.stringify(datos, null, 2));
    } catch (error) {
        console.error("Error al escribir en la base de datos:", error);
    }
};

// Rutas para el API del Sistema de Registro de Asistencias

app.get('/', (req, res) => {
    res.send("API de Sistema de Registro de Asistencias en funcionamiento en el puerto 3000");
});

// Listar Estudiantes 
app.get('/ListarEstudiantes', (req, res) => {
    const datos = leerDatos();
    res.json(datos.estudiantes);
});
// Agregar estudiantes
app.post('/AgregarEstudiante', (req, res) => {
    const datos = leerDatos();
    const nuevoEstudiante = { id: datos.estudiantes.length + 1, ...req.body, estado: "Activo" };
    datos.estudiantes.push(nuevoEstudiante);
    escribirDatos(datos);
    res.json(nuevoEstudiante);
});

// Listar Profesores
app.get('/ListarProfesores', (req, res) => {
    const datos = leerDatos();
    res.json(datos.profesores);
});
// Agregar profesores
app.post('/AgregarProfesor', (req, res) => {
    const datos = leerDatos();
    const nuevoProfesor = { id: datos.profesores.length + 1, ...req.body, estado: "Activo" };
    datos.profesores.push(nuevoProfesor);
    escribirDatos(datos);
    res.json(nuevoProfesor);
});

// Listar a los Tutores
app.get('/ListarTutores', (req, res) => {
    const datos = leerDatos();
    res.json(datos.tutores);
});
// Agregar algun tutor
app.post('/AgregarTutor', (req, res) => {
    const datos = leerDatos();
    const nuevoTutor = { id: datos.tutores.length + 1, ...req.body };
    datos.tutores.push(nuevoTutor);
    escribirDatos(datos);
    res.json(nuevoTutor);
});

// Listar Administradores
app.get('/ListarAdministradores', (req, res) => {
    const datos = leerDatos();
    res.json(datos.admins);
});
// Agregar admins
app.post('/AgregarAdministrador', (req, res) => {
    const datos = leerDatos();
    const nuevoAdmin = { id: datos.admins.length + 1, ...req.body };
    datos.admins.push(nuevoAdmin);
    escribirDatos(datos);
    res.json(nuevoAdmin);
});

// Registro de Asistencia
app.post('/RegistrarAsistencia', (req, res) => {
    const datos = leerDatos();
    const { idPersona, fecha, estado, tipo } = req.body; // tipo puede ser "Estudiante" o "Profesor"
    
    const persona = datos[tipo.toLowerCase() + "s"].find(p => p.id === idPersona);
    if (persona) {
        datos.asistencias.push({ id: datos.asistencias.length + 1, idPersona, fecha, estado, tipo });
        escribirDatos(datos);
        res.json({ message: "Asistencia registrada" });
    } else {
        res.status(404).send(`${tipo} no encontrado`);
    }
});

// Obtener el historial de asistencia
app.get('/HistorialAsistencia/:tipo/:idPersona', (req, res) => {
    const datos = leerDatos();
    const { tipo, idPersona } = req.params;
    const asistencias = datos.asistencias.filter(a => a.idPersona === parseInt(idPersona) && a.tipo.toLowerCase() === tipo.toLowerCase());
    if (asistencias.length > 0) {
        res.json(asistencias);
    } else {
        res.status(404).send("No se encontró historial de asistencia para esta persona");
    }
});

// Gestión de Eventos 
app.get('/ListarEventos', (req, res) => {
    const datos = leerDatos();
    res.json(datos.eventos);
});
// Crear los eventos
app.post('/CrearEvento', (req, res) => {
    const datos = leerDatos();
    const nuevoEvento = { id: datos.eventos.length + 1, ...req.body };
    datos.eventos.push(nuevoEvento);
    escribirDatos(datos);
    res.json(nuevoEvento);
});

// Estadísticas de asistencia (porcentaje de asistencias justificadas/injustificadas)
app.get('/EstadisticasAsistencia', (req, res) => {
    const datos = leerDatos();
    const total = datos.asistencias.length;
    const justificadas = datos.asistencias.filter(a => a.estado === "Justificada").length;
    const injustificadas = total - justificadas;
    res.json({
        total,
        justificadas,
        injustificadas,
        porcentajeJustificadas: (justificadas / total) * 100,
        porcentajeInjustificadas: (injustificadas / total) * 100
    });
});

// Inicializar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
