import Fastify from 'fastify';
import fastifyFormbody from '@fastify/formbody';
import knex from 'knex';

const app = Fastify({ logger: true });

app.register(fastifyFormbody);

const db = knex({
  client: 'pg',
  connection: {
    host: 'bdd',
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  },
});

app.get('/', async (request, reply) => {
  const todos = await db('todo').select();
  const todos_html = todos
    .map(todo => `<li>${todo.task}</li>`)
    .join('');

  const html = `
    <html>
        <ul>${todos_html}</ul>

        <form action="/" method="POST">
          <input type="text" name="task" />
          <button type="submit">Ajouter</button>
        </form>
    </html>
  `;

  reply.type('text/html').send(html);
});

app.post('/', async (request, reply) => {
  const { task } = request.body as { task: string };
  await db('todo').insert({ task }).returning('*');
  reply.status(302).redirect('/');
});

const start = async () => {
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
