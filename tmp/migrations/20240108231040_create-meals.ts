import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.text('name').notNullable()
    table.text('description').notNullable()
    table.boolean('into_diet')
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    table.integer('user_id').unsigned().references('id').inTable('users') // relations
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}
