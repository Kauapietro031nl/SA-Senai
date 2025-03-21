document.addEventListener('DOMContentLoaded', function() {
    // Carregar cursos ao iniciar a página
    carregarCursos();
    
    // Adicionar evento ao botão de gerar relatório
    document.getElementById('btn-gerar-relatorio').addEventListener('click', gerarRelatorio);
});

// Função para carregar os cursos do backend
async function carregarCursos() {
    try {
        const resposta = await fetch('http://localhost:3000/cursos');
        
        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(erro.erro || `Erro HTTP: ${resposta.status}`);
        }
        
        const cursos = await resposta.json();
        const selectCurso = document.getElementById('curso');
        
        // Limpar opções existentes, exceto a primeira
        selectCurso.innerHTML = '<option value="">Selecione um curso</option>';
        
        // Adicionar os cursos do banco de dados
        cursos.forEach(curso => {
            const option = document.createElement('option');
            option.value = curso.id_curso;
            option.textContent = curso.nome_curso;
            selectCurso.appendChild(option);
        });
        
        console.log('Cursos carregados com sucesso:', cursos);
    } catch (erro) {
        console.error('Erro ao carregar cursos:', erro);
        alert('Não foi possível carregar a lista de cursos: ' + erro.message);
    }
}

// Função para gerar o relatório
async function gerarRelatorio() {
    const selectCurso = document.getElementById('curso');
    const id_curso = selectCurso.value;
    
    if (!id_curso) {
        alert('Por favor, selecione um curso para gerar o relatório.');
        return;
    }
    
    try {
        const resposta = await fetch(`http://localhost:3000/relatorio?id_curso=${id_curso}`);
        
        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(erro.erro || `Erro HTTP: ${resposta.status}`);
        }
        
        const dados = await resposta.json();
        exibirRelatorio(dados);
        
        // Exibir o botão de download do PDF
        const botaoPDF = document.getElementById('btn-baixar-pdf');
        botaoPDF.classList.remove('hidden');
        botaoPDF.onclick = () => baixarPDF(id_curso);
    } catch (erro) {
        console.error('Erro ao gerar relatório:', erro);
        alert(`Erro ao gerar relatório: ${erro.message}`);
    }
}

// Função para exibir o relatório na página
function exibirRelatorio(dados) {
    // Atualizar informações básicas
    document.getElementById('nome-curso').textContent = dados.nome_curso;
    document.getElementById('total-alunos').textContent = dados.total_alunos;
    document.getElementById('media-acertos').textContent = dados.media_acertos;
    
    // Calcular e exibir percentual médio
    const percentualMedio = ((dados.media_acertos / 20) * 100).toFixed(1);
    document.getElementById('media-percentual').textContent = `${percentualMedio}%`;
    
    // Atualizar tabela de alunos
    const tabelaRelatorio = document.getElementById('tabela-relatorio');
    tabelaRelatorio.innerHTML = ''; // Limpar conteúdo anterior
    
    // Adicionar os alunos à tabela
    dados.alunos.forEach(aluno => {
        const tr = document.createElement('tr');
        tr.classList.add('aluno-row');
        
        // Definir classe CSS baseada no percentual de acertos
        let classeAcertos = '';
        const percentual = parseFloat(aluno.percentual);
        if (percentual >= 70) {
            classeAcertos = 'acertos-alto';
        } else if (percentual >= 50) {
            classeAcertos = 'acertos-medio';
        } else {
            classeAcertos = 'acertos-baixo';
        }
        
        tr.innerHTML = `
            <td>${aluno.matricula}</td>
            <td>${aluno.nome_aluno}</td>
            <td class="${classeAcertos}">${aluno.acertos}</td>
            <td class="${classeAcertos}">${aluno.percentual}%</td>
        `;
        
        // Adicionar evento para mostrar detalhes do aluno
        tr.addEventListener('click', () => {
            mostrarDetalhesAluno(aluno.matricula, dados.id_curso);
        });
        
        tabelaRelatorio.appendChild(tr);
    });
    
    // Mostrar o container do relatório
    document.getElementById('relatorio-container').classList.remove('hidden');
    // Esconder detalhes do aluno se estiver visível
    document.getElementById('detalhe-aluno').classList.add('hidden');
}

// Função para mostrar detalhes de um aluno específico
async function mostrarDetalhesAluno(matricula, id_curso) {
    try {
        const resposta = await fetch(`http://localhost:3000/relatorio/aluno?matricula=${matricula}&id_curso=${id_curso}`);
        
        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(erro.erro || `Erro HTTP: ${resposta.status}`);
        }
        
        const aluno = await resposta.json();
        
        // Preencher informações do aluno
        document.getElementById('nome-aluno-detalhe').textContent = aluno.nome_aluno;
        document.getElementById('matricula-detalhe').textContent = aluno.matricula;
        document.getElementById('curso-detalhe').textContent = aluno.nome_curso;
        document.getElementById('acertos-detalhe').textContent = aluno.acertos;
        document.getElementById('percentual-detalhe').textContent = `${aluno.percentual}%`;
        
        // Preencher lista de diagnóstico
        const diagnosticoLista = document.getElementById('diagnostico-lista');
        diagnosticoLista.innerHTML = '';
        
        if (aluno.diagnostico && aluno.diagnostico.length > 0) {
            aluno.diagnostico.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                diagnosticoLista.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'Nenhum erro encontrado.';
            diagnosticoLista.appendChild(li);
        }
        
        // Mostrar detalhes do aluno
        document.getElementById('detalhe-aluno').classList.remove('hidden');
        
        // Rolar até os detalhes
        document.getElementById('detalhe-aluno').scrollIntoView({ behavior: 'smooth' });
        
    } catch (erro) {
        console.error('Erro ao carregar detalhes do aluno:', erro);
        alert(`Não foi possível carregar os detalhes do aluno: ${erro.message}`);
    }
}

// Função para baixar o PDF
function baixarPDF(id_curso) {
    window.open(`http://localhost:3000/gerar-pdf?id_curso=${id_curso}`, '_blank');
}