import http from "node:http"

const PORT = 3000;

const tarefas = [
	{id: 1, titulo: "Estudar HTTP do NodeJS"},
	{id: 2, titulo: "Lavar louças"}
];

const server = http.createServer((req, res) => {
	res.setHeader('Content-Type', 'application/json');

	if (req.method == "GET" && req.url == "/tarefas") {
		res.statusCode = 200;
		res.end(JSON.stringify(tarefas));

	} else if (req.method == "GET" && req.url.startsWith("/tarefas/busca")) {
		const url = new URL(req.url, `http://localhost:${PORT}`);
		const titulo = url.searchParams.get("titulo");

		const resultado = tarefas.filter(tarefa =>
			tarefa.titulo.toLowerCase().includes(titulo.toLowerCase())
		);

		res.statusCode = 200;
		res.end(JSON.stringify(resultado));

	} else if (req.method == "POST" && req.url == "/tarefas") {
		let body = '';

		req.on('data', chunk => {
			body += chunk.toString();
		});

		req.on('end', () => {
			try {
				const novaTarefa = JSON.parse(body);

				if (!novaTarefa.titulo) {
					res.statusCode = 400;
					res.end(JSON.stringify({
						error: "O campo 'titulo' é obrigatório!"
					}));
					return;
				}

				const tarefaCriada = {
					id: tarefas.length + 1,
					titulo: novaTarefa.titulo
				};

				tarefas.push(tarefaCriada);

				res.statusCode = 201;
				res.end(JSON.stringify(tarefaCriada));

			} catch (error) {
				res.statusCode = 400;
				res.end(JSON.stringify({
					error: "Formato JSON inválido!"
				}));
			}
		});

	} else if (req.method == "DELETE" && req.url.startsWith("/tarefas")) {
		const url = new URL(req.url, `http://localhost:${PORT}`);
		const index = Number(url.searchParams.get("index"));

		if (isNaN(index) || index < 0 || index >= tarefas.length) {
			res.statusCode = 400;
			res.end(JSON.stringify({
				error: "Índice inválido!"
			}));
			return;
		}

		const tarefaRemovida = tarefas.splice(index, 1);

		res.statusCode = 200;
		res.end(JSON.stringify(tarefaRemovida[0]));

	} else {
		res.statusCode = 404;
		res.end(JSON.stringify({
			error: "Página não encontrada!"
		}));
	}
});

server.listen(PORT, () => {
	console.log(`Servidor rodando na porta: ${PORT}`);
});