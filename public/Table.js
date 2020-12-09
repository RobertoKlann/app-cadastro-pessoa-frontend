/**
 * Classe da tabela de consulta de pessoas.
 * 
 * @author Roberto Oswaldo Klann
 * @since 08/12/2020
 */
class Table {

    constructor() {}

    async load() {

        //iniciando loader
        loadingStart();

        //buscando os dados da API
        await axios.get(`http://localhost:5000/pessoas/get`).then(function (response) {
            let rows = ``;

            //criando as rows da consulta
            for(var i = 0; i < response.data.data.length; i++) {
                rows+= tableConsulta.newRow(response.data.data[i]);
            }

            //limpando o tbody
            $('#tbody-table')[0].innerHTML = '';

            //injetando as linhas da consulta
            $('#tbody-table').append(rows);

            //destroindo loader
            loadingDestroy();

            //fazendo com que as mascaras pegue na consulta
            $('.cpf').mask('000.000.000-00', {reverse: true});
            $('.cnpj').mask('00.000.000/0000-00', {reverse: true});
            $('.phone_with_ddd').mask('(00) 0000-0000');
        }).catch(function (error) {
            //destroindo loader
            loadingDestroy();
            console.clear(error);
            toastr['warning']("Não foi possível buscar os dados!");
        });
    }

    /**
     * Cria uma nova linha para a consulta.
     * 
     * @param {Object} data 
     */
    newRow(data) {
        return `
            <tr>
                <td>${data.pescodigo}</td>
                <td>${data.pesnome}</td>
                <td>${(data.pestipo == 1) ? 'Fisica' : 'Juridica'}</td>
                <td class="${(data.pestipo == 1) ? 'cpf' : 'cnpj'}">${data.pescpfcnpj}</td>
                <td class="phone_with_ddd">${data.pestelefone}</td>
                <td>${data.pesemail}</td>
            </tr>
        `;
    }

}