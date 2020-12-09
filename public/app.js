const tableConsulta = new Table();

$(window).ready(function() {

    $('#btn-novo').on('click', function() {
        $('#card-cadastro').removeClass('d-none');
    });

    $('#btn-close').on('click', function() {
        $('#card-cadastro').addClass('d-none');
        $('#content-enderecos').addClass('d-none');
    });

    $('#add-endereco').on('click', function() {
        $('#content-enderecos').removeClass('d-none');

        //limpando o grid de endereços
        cleanInputsEndereco();
    });

    $('#btn-consultar').on('click', function() {
        //carregando a consulta
        tableConsulta.load();
    });

    $('#tipo').on('change', function() {
        let tipo = $('#tipo').val();

        //verificando qual input está selecionado para poder esconder/mostrar o outro
        if(tipo == 1) {
            $('#cpf').removeClass('d-none');
            $('#cnpj').addClass('d-none');
        } else {
            $('#cpf').addClass('d-none');
            $('#cnpj').removeClass('d-none');
        }

        //limpando os INPUTS
        $('#cpf').val('');
        $('#cnpj').val('');
    });

    $('#btn-confirmar').on('click', function() {
        callStorePessoa();
    });

    //carregando a consulta
    tableConsulta.load();
});

/**
 * Cria uma nova linha para o grid endereços e injeta a linha no grid.
 */
function addFieldEndereco() {
    let item = $("#content-enderecos").children("div").last().attr("item");

    //verificando se o encontrou o ultimo item do GRID de endereços
    if(typeof(item) === "undefined") {
        item = 0;
    }

    item++;
    
    //criando o novo campo
    const novoCampo = `
        <div item="${item}" class="row ml-1">
            <div class="col-2 mt-2 mb-2">
                <input class="form-control cep" type="text" name="cep" id="cep" placeholder="CEP" onchange="onChangeCEP(${item});">
            </div>

            <div class="col-3 mt-2 mb-2">
                <input class="form-control" type="text" name="logradouro" id="logradouro" placeholder="Logradouro" disabled>
            </div>

            <div class="col-2 mt-2 mb-2">
                <input class="form-control" type="text" name="bairro" id="bairro" placeholder="Bairro" disabled>
            </div>

            <div class="col-2 mt-2 mb-2">
                <input class="form-control" type="text" name="localidade" id="localidade" placeholder="Localidade" disabled>
            </div>

            <div class="col-1 mt-2 mb-2">
                <input class="form-control" type="text" name="uf" id="uf" placeholder="UF" disabled>
            </div>

            <div class="col-2 mt-2 mb-2">
                <button class="btn btn-info" type="button" title="Novo endereço" onclick="addFieldEndereco()"><i class="fas fa-plus"></i></button>
                <button class="ml-1 btn btn-info" type="button" title="Novo endereço" onclick="removeFieldEndereco(${item})"><i class="fas fa-minus"></i></button>
            </div>

            <div class="col-1 mt-2 mb-2">
                <input class="form-control" type="text" name="numero" id="numero" placeholder="N°">
            </div>

            <div class="col-2 mt-2 mb-2">
                <select class="form-control" name="endtipo" id="endtipo">
                    <option value="1">Residencial</option>
                    <option value="2">Comercial</option>
                </select>
            </div>
        </div>
    `;
    
    //injeta a div e campos no elemento obtido com a lista de campos
    $("#content-enderecos").append(novoCampo);
    $('.cep').mask('00.000-000');
}

/**
 * Remove a linha do grid de endereços da pessoa.
 * 
 * @param {int} id 
 */
function removeFieldEndereco(id) {
    if($('input[name=cep]').length <= 1) {
        addFieldEndereco();
        $('#content-enderecos div[item='+id+']').remove();

        return;
    } else if($('input[name=cep]').length <= 1) {
        toastr['warning']("Não é possível excluir todas as linhas do grid!");
        return;
    }
    
    $('#content-enderecos div[item='+id+']').remove();
}

/**
 * Faz a busca do CEP informado pelo Usuário no formulário.
 * 
 * @param {int} indiceItem 
 */
function onChangeCEP(indiceItem) {
    const cep = $(`div[item=${indiceItem}] input[id=cep]`).val().replace(/\D/g, '');

    //se não tem o CEP, não faz nada
    if(!cep) return;

    //iniciando loader
    loadingStart();

    //buscando o CEP informado na API de CEPS
    axios.get(`https://viacep.com.br/ws/${cep}/json`).then(function (response) {

        //Verificando se achou o CEP, se não achar exibe a mensagem
        if(response.data.erro) {
            toastr['warning']("Não encontramos o CEP, verifique se os dados estão correto!");
        }

        $(`div[item=${indiceItem}] input[id=logradouro]`).val(response.data.logradouro);
        $(`div[item=${indiceItem}] input[id=bairro]`).val(response.data.bairro);
        $(`div[item=${indiceItem}] input[id=localidade]`).val(response.data.localidade);
        $(`div[item=${indiceItem}] input[id=uf]`).val(response.data.uf);

        //destroindo loader
        loadingDestroy();
    }).catch(function (error) {        
        //destroindo loader
        loadingDestroy();

        console.clear(error);
        toastr['warning']("Não encontramos o CEP, verifique se os dados estão correto!");
    });
}

function cleanInputsEndereco() {
    let qtdeRowsGridEndereco = $('[name=cep]');

    for(var i = 1; i <= qtdeRowsGridEndereco.length; i++) {
        $(`#content-enderecos div[item=${i}]`).remove();

        //verificando se chegou na ultima interação, pois na ultima precisa adicionar uma nova linha
        if(i == qtdeRowsGridEndereco.length) {
            addFieldEndereco();
        }
    }
}

function cleanInputsPessoa() {
    $('[name=nome]').val(''),
    $('[name=cpf]').val('');
    $('[name=cnpj]').val(''),
    $('[name=telefone]').val(''),
    $('[name=email]').val('');
}

async function callStorePessoa() {
    let bValidaEndereco;
    let qtdeRowsGridEndereco = $('[name=cep]');
    let bValidaCamposPessoa  = validaCamposPessoa();

    if(!bValidaCamposPessoa.status) {
        return toastr['warning'](`O campo ${bValidaCamposPessoa.campo} não foi preenchido e é obrigatório!`);
    }

    if(!validaCampoEmail()) {
        return toastr['warning'](`Campo EMAIL inválido!`);
    }

    const enderecos = [];

    for(var i = 1; i <= qtdeRowsGridEndereco.length; i++) {
        
        bValidaEndereco = await validaCamposGridEndereco(i);

        //se não ta valido para de percorrer para avisar o usuário
        if(!bValidaEndereco.status) {
            break;
        }

        if(!$(`div[item=${i}] [name=cep]`).val()) continue;

        enderecos.push({
            "endcep": $(`div[item=${i}] [name=cep]`).val().replace(/\D/g, ''),
			"endlogradouro": $(`div[item=${i}] [name=logradouro]`).val(),
			"endbairro": $(`div[item=${i}] [name=bairro]`).val(),
			"endlocalidade": $(`div[item=${i}] [name=localidade]`).val(),
			"enduf": $(`div[item=${i}] [name=uf]`).val(),
			"endtipo": $(`div[item=${i}] [name=endtipo]`).val(),
			"endnumero": $(`div[item=${i}] [name=numero]`).val()
        });
    }

    if(!bValidaEndereco.status) {
        return toastr['warning'](`O campo ${bValidaEndereco.campo} da linha ${bValidaEndereco.linha} não foi preenchido e é obrigatório!`);
    }

    const data = {
        "pesnome": $('[name=nome]').val(),
        "pestipo": $('[name=tipo]').val(),
        "pescpfcnpj": ($('[name=cpf]').val()) ? $('[name=cpf]').val().replace(/\D/g, '') : $('[name=cnpj]').val().replace(/\D/g, ''),
        "pestelefone": $('[name=telefone]').val().replace('(', '').replace(')', '').replace('-', ''),
        "pesemail": $('[name=email]').val(),
        enderecos
    };

    loadingStart();

    await axios.post(`http://localhost:5000/pessoas/store`, data)
    .then(function (response) {
        toastr['success']("Registro inserido com sucesso!");

        //limpando o grid de endereços e pessoa
        cleanInputsEndereco();
        cleanInputsPessoa();

        //destroindo loader
        loadingDestroy();

        //carregando a consulta para buscar o dado novo
        tableConsulta.load();
    }).catch(function (error) {
        //destroindo loader
        loadingDestroy();

        console.clear(error);
        toastr['warning']("Não foi possível incluir os dados!");
    });
}

function validaCampoEmail() {
    let usuario = $('[name=email]').val().substring(0, $('[name=email]').val().indexOf("@")),
        dominio = $('[name=email]').val().substring($('[name=email]').val().indexOf("@") + 1, $('[name=email]').val().length);

    if ((usuario.length >=1) && (dominio.length >=3) && (usuario.search("@")==-1) && (dominio.search("@")==-1) 
            && (usuario.search(" ")==-1) && (dominio.search(" ")==-1) && (dominio.search(".")!=-1) && (dominio.indexOf(".") >=1)
            && (dominio.lastIndexOf(".") < dominio.length - 1))
    {
        return true;
    }

    return false;
}

async function validaCamposGridEndereco(i) {
    if($(`div[item=${i}] [name=cep]`).val() && !$(`div[item=${i}] [name=logradouro]`).val()) {
        return {'status': false, 'campo': 'LOGRADOURO', 'linha': i};
    }

    if($(`div[item=${i}] [name=cep]`).val() && !$(`div[item=${i}] [name=bairro]`).val()) {
        return {'status': false, 'campo': 'BAIRRO', 'linha': i};
    }

    if($(`div[item=${i}] [name=cep]`).val() && !$(`div[item=${i}] [name=localidade]`).val()) {
        return {'status': false, 'campo': 'LOCALIDADE', 'linha': i};
    }

    if($(`div[item=${i}] [name=cep]`).val() && !$(`div[item=${i}] [name=uf]`).val()) {
        return {'status': false, 'campo': 'UF', 'linha': i};
    }

    if($(`div[item=${i}] [name=cep]`).val() && !$(`div[item=${i}] [name=endtipo]`).val()) {
        return {'status': false, 'campo': 'TIPO ENDEREÇO', 'linha': i};
    }

    if($(`div[item=${i}] [name=cep]`).val() && !$(`div[item=${i}] [name=numero]`).val()) {
        return {'status': false, 'campo': 'NÚMERO', 'linha': i};
    }

    return {'status': true};
}

function validaCamposPessoa() {
    if(!$(`[name=nome]`).val()) {
        return {'status': false, 'campo': 'NOME'};
    }

    if(!$(`[name=tipo]`).val()) {
        return {'status': false, 'campo': 'TIPO PESSOA'};
    }

    if($(`[name=tipo]`).val() == 1) {
        if(!$(`[name=cpf]`).val()) {
            return {'status': false, 'campo': 'CPF'};
        }
    } else {
        if(!$(`[name=cnpj]`).val()) {
            return {'status': false, 'campo': 'CNPJ'};
        }
    }

    if(!$(`[name=telefone]`).val()) {
        return {'status': false, 'campo': 'TELEFONE'};
    }

    if(!$(`[name=email]`).val()) {
        return {'status': false, 'campo': 'EMAIL'};
    }

    return {'status': true};
}

function loadingStart(id) {
    if (!id) id = 'loading';

    byId(id).classList.add('is-active');
}

function loadingDestroy(id, _timeout) {
    if (!id) id = 'loading';

    const timeout = _timeout || 0;

    setTimeout(() => byId(id).classList.remove('is-active'), timeout);
}

function byId(id) {
    return document.getElementById(id);
}

//adicionando as mascaras aos campos que precisa
$('.cpf').mask('000.000.000-00', {reverse: true});
$('.cnpj').mask('00.000.000/0000-00', {reverse: true});
$('.phone_with_ddd').mask('(00) 0000-0000');
$('.cep').mask('00.000-000');