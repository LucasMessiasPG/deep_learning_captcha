const puppeteer = require("puppeteer");
const request = require("request");

(async () => {
	const browser = await puppeteer.launch({
		headless: true
	});
	
	async function extractInfo(page) {
		try {
			let tables = await page.evaluate(() => {
				let texts = [];
				let index_1 = 0;
				var tbodys = document.querySelectorAll("tbody");
				for (let tbody of tbodys) {
					index_1++;
					if (!texts[index_1]) texts[index_1] = [];
					let trs = tbody.querySelectorAll("tr");
					let index_2 = 0;
					for ( let tr of trs) {
						index_2++;
						if (!texts[index_1][index_2]) texts[index_1][index_2] = [];
						let tds = tr.querySelectorAll("td");
						tds.forEach(item => {
							let text = item.innerText;
							text = text.replace(/[\r\n\t]/g, "").trim();
							text && texts[index_1][index_2].push(text);
						});
					}
				}
				return texts;
			});
			tables = tables.filter(item => item != null).map(item => {
				item = item.filter(item2 => item2 != null);
				return item;
			}).filter(item => item.length);
			let info = {};
			console.log(tables);

			for (let i in tables) {
				if (["0", "1", "5", "7", "9"].indexOf(i.toString()) !== -1) continue;
				let item = tables[i];
				console.log(item, i);

				switch (i.toString()) {
					case "2":
						info.themis = item[0] && item[0][2];
						info.cnj = item[1] && item[1][1];
						break;
					case "3":
						info.stage = item[1] && item[1][0];
						info.legalSecrect = item[1] && item[1][1].indexOf("Não") === -1;
						break;
					case "4":
						info.location = {
							city:  item[0] && item[0][1],
							state: "RS",
							place: item[1][1]
						};
						info.proposedDate = item[2][1];
						info.situationDescription = item[3][1];
						info.situation = item[4][1];
						info.volume = item[5][1];
						info.amountSheets = item[6][1] || 0;
						break;
					case "6":
						info.parties = { 
							author: {
								name: item[1][0],
								adv:  {
									name: item[3][0],
									oab:  item[3][1]
								}
							},
							defendant: {
								name: item[5][0],
								adv:  {
									name: item[7][0],
									oab:  item[7][1]
								}
							}
						};
						break;
					case "8":
						info.history = [];
						for (let i of item) {
							info.history.push({
								date:        i[0],
								description: i[1]
							});
						}
						break;
				}
			}
			console.log(info);
			// request.post("http://localhost:8081/api/update", { form: info }, function(err, response) {
			// 	if (err) throw err;
			// 	return true;
			// });
			// console.log(tds);
		} catch (error) {
			console.log(error);
			console.log("catch error");
		}
	}
	
	try {
		const page = await browser.newPage();
		await page.setContent(html);
		extractInfo(page);
	} catch (err) {
		count2++;
		console.log("catch error");
		processPage();
	}
})();

const html = `<html><head>
<title>Tribunal de Justiça do Estado do Rio Grande do Sul</title>
 
	<link href="../../../css/geral.css" rel="stylesheet" type="text/css">
		<script language="JavaScript">
	function Generica(){
		return;
	}
</script>
<style>
	@media print { 
		#noprint { display:none; } 
	}
</style>
</head>
<body onload="javascript:Generica()">
		<!--span class="titulos_Processos">Processos 
			&gt; Acompanhamento Processual</span-->

<script language="JavaScript" type="text/JavaScript">
<!--
function MM_openBrWindow(theURL,winName,features) { //v2.0
window.open(theURL,winName,features);
}
//-->
function msgsaoex(){
alert ("Consulta desabilitada! Verificar mensagem acima.");
}
</script>
<table style="width: 100%" border="0" align="center">
<tbody><tr> 
<td nowrap="" style="width:450px;"><div id="titulo"><span class="texto_geral_negrito">Consulta de 1º Grau</span><span class="texto_geral"><br>
			Poder Judiciário do Estado do Rio Grande do Sul</span></div></td>
<td align="right" nowrap=""><div align="right">
	<table>
	<tbody><tr>
	<td><script language="JavaScript" src="/javascript/impressao.js"></script><a href="javascript:AbreImpressao();"><img src="imagens/versao_impressao.gif" alt="Versão para impressão" border="0"></a>            </td>
				<td><form name="impressao_totem" action="impressao_recibo.php" target="_blank" method="get" style="float:left">
<input type="hidden" name="num_processo" value="10800000840">
<input type="hidden" name="id_comarca" value="agudo">
<input type="hidden" name="eh_ethemis" value="">
<input type="hidden" name="cod_comarca" value="154">
<input type="hidden" name="num_processo_mask" value="00008418120088210154">
<input type="image" src="imagens/recibo.png" alt="Imprimir recibo" title="Imprimir recibo" style="border:0px;">
</form></td>
				<td>                    <a href="index.php"><img src="imagens/nova_pesq.gif" alt="Nova pesquisa" border="0"></a>
	</td>
	</tr>
	</tbody></table></div>
</td>
</tr>
</tbody></table>
<div id="conteudo">
<br>

<table width="100%" border="0" align="center" cellspacing="1" cellpadding="1">
<tbody><tr bgcolor="#CCCCCC"> 
	<td class="texto_geral_negrito" nowrap="">Processo Cível</td>
	
	<td class="texto_geral_negrito">Número Themis:</td> 
	<td class="texto_geral">154/1.08.0000084-0</td>
				<td class="texto_geral_negrito" nowrap="">Processo Principal:</td>
	<td class="texto_geral"><a href="consulta_processo.php?entrancia=1&amp;num_processo=&amp;id_comarca=agudo&amp;code=3072&amp;nomecomarca=&lt;?=AGUDO?&gt;&amp;orgao=&lt;?=Vara Judicial?&gt;"></a>                &nbsp;</td>
	</tr>

<tr bgcolor="#CCCCCC"> 
	<td class="texto_geral_negrito" nowrap="">&nbsp;</td>
	<td class="texto_geral_negrito">Número CNJ:</td>
	<td class="texto_geral">0000841-81.2008.8.21.0154            </td>
	<td class="texto_geral_negrito">Processos Reunidos:</td>
					<td class="texto_geral" align="left" nowrap=""><a href="consulta_procvinc.php?entrancia=1&amp;comarca=agudo&amp;num_processo=10800000840&amp;code=3072&amp;nomecomarca=AGUDO&amp;orgao=Vara Judicial">Ver Processos</a></td>
						</tr>

<tr bgcolor="#CCCCCC"> 
	<td>&nbsp;</td>
	<td class="texto_geral_negrito"> 
								&nbsp; 
						</td> 

	<td class="texto_geral"> 
						&nbsp;</td>
				<td class="texto_geral_negrito" width="130" nowrap="">&nbsp;</td>
	<td class="texto_geral">&nbsp;</td>
	 
</tr>
</tbody></table>

		<table width="100%" border="0" align="center" cellspacing="1" cellpadding="1">
		<tbody><tr bgcolor="#E5E5E5"> 
			<td style="width:10px">&nbsp;</td>
			<td colspan="3" class="texto_geral">PROCEDIMENTO ESPECIAL DE JURISDIÇÃO CONTENCIOSA&nbsp;</td>
		</tr>
		<tr bgcolor="#E5E5E5"> 
			<td style="width:10px">&nbsp;</td>
			<td class="texto_geral">Reintegração de Posse    -   Fase de cumprimento de sentença&nbsp;</td>
			<td style="width:180" class="texto_geral">Segredo de Justiça:&nbsp;&nbsp; Não</td>
								<td style="width:250" class="texto_geral">Tramitação preferencial-Idoso:&nbsp;&nbsp;Não </td>
							</tr>
	</tbody></table>

	<table width="100%" border="0" align="center" cellspacing="1" cellpadding="1">  
		<tbody><tr bgcolor="#E5E5E5"> 
			<td style="width:10px">&nbsp;</td>
			<td style="width:150" class="texto_geral_negrito">Comarca:</td>  
									<td colspan="3" class="texto_geral">AGUDO</td>
		
		</tr>
		<tr bgcolor="#E5E5E5"> 
			<td style="width:10px">&nbsp;</td>
			<td style="width:150" class="texto_geral_negrito">Órgão Julgador:</td>
			<td class="texto_geral" colspan="3">Vara Judicial  : 1 / 1</td>
							</tr>
		<tr bgcolor="#E5E5E5"> 
			<td style="width:10px">&nbsp;</td>
			<td style="width:150" class="texto_geral_negrito">
Data da Propositura:		
			</td>
			<td class="texto_geral" nowrap="" colspan="3">30/01/2008</td>
		</tr>
		
		<tr bgcolor="#E5E5E5"> 
			<td style="width:10px">&nbsp;</td>
			<td style="width:150" class="texto_geral_negrito">Local dos Autos:</td>
			<td class="texto_geral" colspan="3">PROCESSO AGUARDANDO JUNTADA J PRI 27</td>
		</tr>
		<tr bgcolor="#E5E5E5"> 
			<td style="width:10px">&nbsp;</td>
			<td style="width:150" class="texto_geral_negrito">Situação do Processo:</td>
			<td class="texto_geral" colspan="3">COM CARTÓRIO</td>
		</tr>
		   
		<tr bgcolor="#E5E5E5"> 
			<td style="width:10px">&nbsp;</td>
			<td class="texto_geral_negrito" style="width:150">Volume(s):</td>
			<td class="texto_geral" colspan="3">1&nbsp;</td>
		</tr>
		<tr bgcolor="#E5E5E5"> 
			<td style="width:10px">&nbsp;</td>
			<td class="texto_geral_negrito">Quantidade de folhas:</td>
			<td class="texto_geral" colspan="3">&nbsp;</td>
		</tr>
	</tbody></table>
  

<br>

<table width="100%" border="0" align="center" cellpadding="1" cellspacing="1">
	<tbody><tr bgcolor="#CCCCCC"> 
		<td class="texto_geral_negrito" colspan="2" style="width: 50%; text-align: left">&nbsp;Partes:</td>
			
			<td class="texto_geral" style="width: 50%; text-align: right"><a href="consulta_partes.php?entrancia=1&amp;comarca=agudo&amp;num_processo=10800000840&amp;code=3072&amp;nomecomarca=AGUDO&amp;orgao=Vara Judicial : 1 / 1">Ver todas as partes e advogados</a>&nbsp;</td>
			
	</tr>
</tbody></table>

<table width="100%" border="0" align="center" cellspacing="1" cellpadding="1">
						<tbody><tr bgcolor="#E5E5E5"> 
				<td width="10">&nbsp;</td>
				<td class="texto_geral_negrito">Nome:</td>
				<td class="texto_geral_negrito" width="200">Designação:</td>
			</tr>

			<tr bgcolor="#E5E5E5"> 
				<td width="10">&nbsp;</td>
					
					<td class="texto_geral">MADEIREIRA HERVAL LTDA</td>
				
				<td class="texto_geral">AUTORA&nbsp;</td>
			</tr>
											<tr bgcolor="#E5E5E5"> 
					<td width="20">&nbsp;</td>
					<td class="texto_geral_negrito">Advogado:</td>	
					<td class="texto_geral_negrito">
		OAB:	
						&nbsp;</td>
				</tr>
				<tr bgcolor="#E5E5E5"> 
					<td width="20">&nbsp;</td>
					<td class="texto_geral">ARTHUR ANTONIO GOULART&nbsp;</td>
					<td class="texto_geral">RS 39673   &nbsp;</td>
				</tr>
							<tr bgcolor="#CCCCCC"> 
				<td width="10">&nbsp;</td>
				<td class="texto_geral_negrito">Nome:</td>
				<td class="texto_geral_negrito" width="200">Designação:</td>
			</tr>

			<tr bgcolor="#CCCCCC"> 
				<td width="10">&nbsp;</td>
					
					<td class="texto_geral">GILBERTO DE OLIVEIRA CARVALHO</td>
				
				<td class="texto_geral">RÉU&nbsp;</td>
			</tr>
											<tr bgcolor="#CCCCCC"> 
					<td width="20">&nbsp;</td>
					<td class="texto_geral_negrito">Advogado:</td>	
					<td class="texto_geral_negrito">
		OAB:	
						&nbsp;</td>
				</tr>
				<tr bgcolor="#CCCCCC"> 
					<td width="20">&nbsp;</td>
					<td class="texto_geral">CRISTIANO MULLER&nbsp;</td>
					<td class="texto_geral">RS 49624   &nbsp;</td>
				</tr>
		
</tbody></table>

<br>
<table width="100%" border="0" align="center" cellspacing="1" cellpadding="1">
	<tbody><tr bgcolor="#CCCCCC"> 
		<td class="texto_geral_negrito" style="width: 50%; text-align: left">Últimas Movimentações:</td>
		<td class="texto_geral" style="width: 50%; text-align: right"><a href="consulta_movimentos.php?entrancia=1&amp;comarca=agudo&amp;num_processo=10800000840&amp;code=3072&amp;nomecomarca=AGUDO&amp;orgao=Vara Judicial : 1 / 1">Ver todas as movimentações</a>&nbsp;</td>             </tr>
</tbody></table>
				<table width="100%" border="0" align="center" cellspacing="1" cellpadding="1">
									<tbody><tr bgcolor="#E5E5E5"> 
				<td width="20">&nbsp;</td>
				<td class="texto_geral" width="75" align="center">&nbsp;02/10/2018</td>
				<td class="texto_geral" width="471"> &nbsp; 
					REMETIDOS OS AUTOS EM DILIGÊNCIA PARA CONTADOR                        </td>
			</tr>
							<tr bgcolor="#E5E5E5"> 
				<td width="20">&nbsp;</td>
				<td class="texto_geral" width="75" align="center">&nbsp;03/10/2018</td>
				<td class="texto_geral" width="471"> &nbsp; 
					RECEBIDOS OS AUTOS CUMPRIR DESPACHO                        </td>
			</tr>
							<tr bgcolor="#E5E5E5"> 
				<td width="20">&nbsp;</td>
				<td class="texto_geral" width="75" align="center">&nbsp;04/10/2018</td>
				<td class="texto_geral" width="471"> &nbsp; 
					EXPEDIÇÃO DE NOTA DE EXPEDIENTE 157/2018                        </td>
			</tr>
							<tr bgcolor="#E5E5E5"> 
				<td width="20">&nbsp;</td>
				<td class="texto_geral" width="75" align="center">&nbsp;08/10/2018</td>
				<td class="texto_geral" width="471"> &nbsp; 
					DISPONIBILIZADO NO DJ ELETRONICO 157/2018 DJE Nº 6364 EM 08/10/2018                        </td>
			</tr>
							<tr bgcolor="#E5E5E5"> 
				<td width="20">&nbsp;</td>
				<td class="texto_geral" width="75" align="center">&nbsp;26/10/2018</td>
				<td class="texto_geral" width="471"> &nbsp; 
					RECEBIDOS OS AUTOS JUNTAR DOCUMENTOS                        </td>
			</tr>
					</tbody></table>
			<br>

<div style="text-align: left" id="noprint">
<table style="width: 100%" border="0" align="left" cellspacing="1" cellpadding="1">

<tbody><tr> 
			</tr>

				   

<tr> 
			</tr>



<tr> 
			</tr>
  
<tr> 
					<td class="texto_geral"><a href="consulta_nota_exped.php?entrancia=1&amp;comarca=agudo&amp;num_processo=10800000840&amp;nomecomarca=AGUDO&amp;orgao=Vara Judicial : 1 / 1">Ver Notas de Expediente</a></td>
		</tr>

					<tr> 
									<td class="texto_geral"><a href="consulta_audiencia.php?entrancia=1&amp;comarca=agudo&amp;num_processo=10800000840&amp;cod_comarca=154&amp;code=3072&amp;nomecomarca=AGUDO&amp;orgao=Vara Judicial : 1 / 1">Ver Audiências</a></td>
					</tr>
						<tr> 
									<td class="texto_geral"><a href="consulta_termos_audiencia.php?entrancia=1&amp;comarca=agudo&amp;num_processo=10800000840&amp;code=3072&amp;nomecomarca=AGUDO&amp;orgao=Vara Judicial : 1 / 1">Ver Termos de Audiência</a></td>
					</tr>
		<tr> 
									<td class="texto_geral"><a href="consulta_leiloes.php?entrancia=1&amp;comarca=agudo&amp;num_processo=10800000840&amp;code=3072&amp;nomecomarca=AGUDO&amp;orgao=Vara Judicial : 1 / 1">Ver Leilões</a></td>
					   </tr>
		<tr> 
						<td class="texto_geral"><a href="consulta_sentenca.php?id_comarca=agudo&amp;num_processo=10800000840&amp;code=3072&amp;nomecomarca=AGUDO&amp;orgao=Vara Judicial : 1 / 1">Ver Sentença</a></td>
					 </tr>
		<tr> 

				<td class="texto_geral"><a href="consulta_outinfo.php?entrancia=1&amp;comarca=agudo&amp;num_processo=10800000840&amp;code=3072&amp;nomecomarca=AGUDO&amp;orgao=Vara Judicial : 1 / 1">Ver Outras Informações</a></td>

		</tr>
		<tr>
				<td class="texto_geral"><a href="consulta_dados2g.php?entrancia=1&amp;comarca=agudo&amp;num_processo=10800000840&amp;numero_antigo=&amp;cod_comarca=154&amp;code=3072&amp;nomecomarca=AGUDO&amp;orgao=Vara Judicial : 1 / 1">Ver Dados do 2º Grau</a></td>

		</tr>
		<tr><td class="texto_geral"><a href="consulta_mandados.php?numero_processo=10800000840&amp;comarca=agudo&amp;nome_comarca=AGUDO&amp;entrancia=1&amp;tipo=3&amp;code=3072&amp;segredo_justica=Não&amp;cod_comarca=154&amp;nomecomarca=AGUDO&amp;orgao=Vara Judicial : 1 / 1">Ver Mandados Oficiais</a></td></tr>
					 
	   <tr> 
									<td class="texto_geral">    
										  <a href="consulta_depositos_judiciais.php?&amp;num_processo=10800000840&amp;comarca=agudo&amp;nome_comarca=AGUDO&amp;entrancia=1&amp;tipo=3&amp;code=3072&amp;nomecomarca=AGUDO&amp;orgao=Vara Judicial : 1 / 1">Ver Depósitos Judiciais de 1º grau</a>
									 </td>   
							</tr>
	<tr> 
						<td class="texto_geral">
			<a href="consulta_alvaras_automatizados.php?&amp;num_processo=10800000840&amp;comarca=agudo&amp;nome_comarca=AGUDO&amp;entrancia=1&amp;tipo=3&amp;code=3072&amp;nomecomarca=AGUDO&amp;orgao=Vara Judicial : 1 / 1">Ver Alvarás Automatizados Expedidos</a>
		</td>
					</tr>
	<tr>
						<td class="texto_geral">
			<a href="consulta_gupj.php?&amp;num_processo=10800000840&amp;comarca=agudo&amp;nome_comarca=AGUDO&amp;entrancia=1&amp;tipo=3&amp;code=3072&amp;nomecomarca=AGUDO&amp;orgao=Vara Judicial : 1 / 1">Ver Guias de Custas</a></td>
					</tr>
</tbody></table>
</div>   
<p class="Subtitulos"><br>
<table style="width: 100%" border="0" align="center" cellspacing="1" cellpadding="1">
<tbody><tr> 
	<td class="texto_geral" width="50%"><strong>Última atualização:</strong> 26/10/2018</td>
	<td width="50%"></td>
</tr>
<tr> 
	<td class="texto_geral" style="width: 50%"><b>Data da consulta</b>: 27/10/2018</td>
	<td class="texto_geral" style="width: 50%"><b>Hora da consulta:</b> 09:49:04</td>
</tr>
</tbody></table>
</p>
</div>    
<br>
<table width="100%" border="0" align="center">
<tbody><tr> 
<td nowrap="">&nbsp;</td>
<td width="290" align="right" nowrap="">
<!--a href="javascript:AbreImpressao();"><img src="imagens/versao_impressao.gif" alt="Vers&atilde;o para impress&atilde;o"border="0"></a-->        <!--a href="index.php"><img src="imagens/nova_pesq.gif" alt="Nova pesquisa" border="0"></a!-->
</td>
</tr>
</tbody></table>
<br><br>		  
		
<script type="text/javascript">
var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));
</script><script src="http://www.google-analytics.com/ga.js" type="text/javascript"></script>
<script type="text/javascript">
try {
var pageTracker = _gat._getTracker("UA-7777936-1");
pageTracker._trackPageview();
pageTracker._trackEvent('IPS_Consulta_Processual', 'Acesso_v2', '177.92.47.122');
pageTracker._trackEvent('Origem', 'Acesso', 'externo');
} catch(err) {}
</script>  

</body></html>`;