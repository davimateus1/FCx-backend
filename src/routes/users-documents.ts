import { FastifyInstance } from 'fastify'
import prisma from '../database/client'

import ExcelJS from 'exceljs'
import PDFDocument from 'pdfkit'

import { Document, Paragraph, Packer, Table, TableRow, TableCell } from 'docx'

export async function usersDocumentsRoutes(app: FastifyInstance) {
  app.get('/xlsx', async (_, reply) => {
    const users = await prisma.user.findMany()

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Users')

    worksheet.addRow([
      'ID',
      'Nome',
      'Email',
      'Login',
      'Senha',
      'Nome da Mãe',
      'CPF',
      'Data de Nascimento',
      'Status',
      'Telefone',
      'Idade',
    ])

    users.forEach((user) => {
      worksheet.addRow([
        user.id,
        user.name,
        user.email,
        user.login,
        user.password,
        user.motherName,
        user.cpf,
        user.birthDate.toLocaleDateString('pt-BR', {
          timeZone: 'UTC',
        }),
        user.status,
        user.phone,
        user.age,
      ])
    })

    const buffer = await workbook.xlsx.writeBuffer()

    reply.header(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
    reply.header('Content-Disposition', 'attachment; filename=users.xlsx')

    return reply.send(buffer).code(200)
  })

  app.get('/pdf', async (_, reply) => {
    const users = await prisma.user.findMany()

    const pdf = new PDFDocument()

    pdf.fontSize(20).text('Usuários', { align: 'center' })

    pdf.moveDown()

    users.forEach((user) => {
      pdf.fontSize(15).text(`ID: ${user.id}`)
      pdf.fontSize(15).text(`Nome: ${user.name}`)
      pdf.fontSize(15).text(`Email: ${user.email}`)
      pdf.fontSize(15).text(`Login: ${user.login}`)
      pdf.fontSize(15).text(`Senha: ${user.password}`)
      pdf.fontSize(15).text(`Nome da Mãe: ${user.motherName}`)
      pdf.fontSize(15).text(`CPF: ${user.cpf}`)
      pdf.fontSize(15).text(
        `Data de Nascimento: ${new Date(user.birthDate).toLocaleDateString(
          'pt-BR',
          {
            timeZone: 'UTC',
          },
        )}`,
      )
      pdf.fontSize(15).text(`Status: ${user.status}`)
      pdf.fontSize(15).text(`Telefone: ${user.phone}`)
      pdf.fontSize(15).text(`Idade: ${user.age}`)
      pdf.moveDown()
    })

    reply.header('Content-Type', 'application/pdf')
    reply.header('Content-Disposition', 'attachment; filename=users.pdf')

    pdf.end()

    return reply.send(pdf).code(200)
  })

  app.get('/docx', async (_, reply) => {
    const users = await prisma.user.findMany()

    const tableRows = users.map((user) => [
      { val: `Id: ${user.id}` },
      { val: `Nome: ${user.name}` },
      { val: `E-mail: ${user.email}` },
      { val: `Login: ${user.login}` },
      { val: `Senha: ${user.password}` },
      { val: `Nome da mãe: ${user.motherName}` },
      { val: `CPF: ${user.cpf}` },
      {
        val: `Data de nascimento: ${new Date(user.birthDate).toLocaleDateString(
          'pt-BR',
          {
            timeZone: 'UTC',
          },
        )}`,
      },
      { val: `Status: ${user.status}` },
      { val: `Telefone: ${user.phone}` },
      { val: `Idade: ${user.age}` },
    ])

    const table = new Table({
      rows: [
        ...tableRows.map(
          (row) =>
            new TableRow({
              children: row.map(
                (cell) =>
                  new TableCell({
                    children: [new Paragraph(cell.val)],
                  }),
              ),
            }),
        ),
      ],
    })

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: 'Usuários',
            }),
            table,
          ],
        },
      ],
    })

    const buffer = await Packer.toBuffer(doc)

    reply.header(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    )
    reply.header('Content-Disposition', 'attachment; filename=users.docx')

    return reply.send(buffer).code(200)
  })
}
