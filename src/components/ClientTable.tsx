import styled from 'styled-components';

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background: #fdba74;
  padding: 0.75rem;
  text-align: left;
`;

const Td = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
`;

const Tr = styled.tr`
  &:nth-child(even) {
    background: #f9fafb;
  }
`;

const ActionButton = styled.button`
  margin-right: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
`;

interface Client {
  name: string;
  document: string;
  email: string;
  phone: string;
  vehicle: string;
}

const clients: Client[] = [
  {
    name: 'Deyvid Gondim de Jesus',
    document: '448.249.948-02',
    email: 'emailteste@gmail.com',
    phone: '(38) 999662908',
    vehicle: 'Honda Civic SI Turbo - BRA2E19',
  },
  {
    name: 'Maria Silva',
    document: '123.456.789-01',
    email: 'maria.silva@gmail.com',
    phone: '(11) 987654321',
    vehicle: 'VW Gol - BRA1B22',
  },
  {
    name: 'João Souza',
    document: '987.654.321-00',
    email: 'joao.souza@gmail.com',
    phone: '(21) 999888777',
    vehicle: 'Ford Ka - BRA2C33',
  },
  {
    name: 'Carlos Pereira',
    document: '111.222.333-44',
    email: 'carlos.pereira@mail.com',
    phone: '(31) 988776655',
    vehicle: 'Chevrolet Onix - BRA4D44',
  },
  {
    name: 'Bruna Rocha',
    document: '555.666.777-88',
    email: 'bruna.rocha@mail.com',
    phone: '(71) 987123456',
    vehicle: 'Renault Clio - BRA5E55',
  },
  {
    name: 'Ricardo Alves',
    document: '222.333.444-55',
    email: 'ricardo.alves@mail.com',
    phone: '(61) 998112233',
    vehicle: 'Toyota Corolla - BRA6F66',
  },
  {
    name: 'Paula Costa',
    document: '666.777.888-99',
    email: 'paula.costa@mail.com',
    phone: '(41) 987654000',
    vehicle: 'Honda Fit - BRA7G77',
  },
  {
    name: 'Fernanda Gomes',
    document: '444.555.666-77',
    email: 'fernanda.gomes@mail.com',
    phone: '(51) 999332211',
    vehicle: 'Hyundai HB20 - BRA8H88',
  },
  {
    name: 'Pedro Martins',
    document: '777.888.999-00',
    email: 'pedro.martins@mail.com',
    phone: '(81) 988445566',
    vehicle: 'Nissan March - BRA9I99',
  },
  {
    name: 'Lucas Oliveira',
    document: '888.999.000-11',
    email: 'lucas.oliveira@mail.com',
    phone: '(91) 987777666',
    vehicle: 'Peugeot 208 - BRA0J00',
  },
  {
    name: 'Aline Santos',
    document: '999.000.111-22',
    email: 'aline.santos@mail.com',
    phone: '(31) 996633221',
    vehicle: 'Kia Soul - BRA1K11',
  },
];

export default function ClientTable() {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Nome</Th>
          <Th>Documento</Th>
          <Th>E-mail</Th>
          <Th>Telefone</Th>
          <Th>Veículos</Th>
          <Th></Th>
        </tr>
      </thead>
      <tbody>
        {clients.map((client, index) => (
          <Tr key={index}>
            <Td>{client.name}</Td>
            <Td>{client.document}</Td>
            <Td>{client.email}</Td>
            <Td>{client.phone}</Td>
            <Td>{client.vehicle}</Td>
            <Td>
              <ActionButton title="Editar">✏️</ActionButton>
              <ActionButton title="Visualizar">🔗</ActionButton>
            </Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}
