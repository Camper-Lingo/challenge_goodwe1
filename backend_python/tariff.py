import datetime


def obter_info_tarifa(horario_atual):
    """
    Retorna a tarifa atual e o momento exato em que ela muda.
    """

    # Fim de semana
    if horario_atual.weekday() >= 5:
        limite = (
            horario_atual + datetime.timedelta(days=1)
        ).replace(hour=0, minute=0, second=0, microsecond=0)

        return 0.59, limite, "Fora de Ponta (FDS)"

    tempo = horario_atual.time()

    if tempo < datetime.time(16, 0):
        taxa = 0.59
        nome = "Fora de Ponta"
        limite = horario_atual.replace(
            hour=16, minute=0, second=0, microsecond=0
        )

    elif tempo < datetime.time(17, 0):
        taxa = 0.87
        nome = "Intermediário"
        limite = horario_atual.replace(
            hour=17, minute=0, second=0, microsecond=0
        )

    elif tempo < datetime.time(20, 0):
        taxa = 1.39
        nome = "Ponta"
        limite = horario_atual.replace(
            hour=20, minute=0, second=0, microsecond=0
        )

    elif tempo < datetime.time(21, 0):
        taxa = 0.87
        nome = "Intermediário"
        limite = horario_atual.replace(
            hour=21, minute=0, second=0, microsecond=0
        )

    else:
        taxa = 0.59
        nome = "Fora de Ponta"
        limite = (
            horario_atual + datetime.timedelta(days=1)
        ).replace(hour=0, minute=0, second=0, microsecond=0)

    return taxa, limite, nome


def calcular_carga_por_energia(energia_necessaria, potencia_kw, horario_inicio):
    """
    Calcula quanto tempo e quanto custa para fornecer uma quantidade
    específica de energia, respeitando as mudanças de tarifa.
    """

    energia_restante = energia_necessaria
    horario_atual = horario_inicio
    custo_total = 0.0
    sessao_log = []

    while energia_restante > 0.001:

        taxa_atual, proxima_mudanca, nome_tarifa = obter_info_tarifa(
            horario_atual
        )

        segundos_restantes = (
            proxima_mudanca - horario_atual
        ).total_seconds()

        horas_restantes = segundos_restantes / 3600.0

        energia_max_bloco = potencia_kw * horas_restantes

        # A energia necessária cabe dentro da tarifa atual
        if energia_restante <= energia_max_bloco:

            tempo_gasto_horas = energia_restante / potencia_kw
            custo = energia_restante * taxa_atual

            horario_atual += datetime.timedelta(
                hours=tempo_gasto_horas
            )

            custo_total += custo

            sessao_log.append({
                "tarifa": nome_tarifa,
                "taxa_kwh": taxa_atual,
                "kwh_fornecido": round(energia_restante, 2),
                "valor_gasto": round(custo, 2)
            })

            energia_restante = 0

        else:
            custo = energia_max_bloco * taxa_atual

            energia_restante -= energia_max_bloco
            custo_total += custo

            sessao_log.append({
                "tarifa": nome_tarifa,
                "taxa_kwh": taxa_atual,
                "kwh_fornecido": round(energia_max_bloco, 2),
                "valor_gasto": round(custo, 2)
            })

            horario_atual = proxima_mudanca

    tempo_total_minutos = (
        horario_atual - horario_inicio
    ).total_seconds() / 60

    return {
        "energia_total_kwh": round(energia_necessaria, 2),
        "custo_total": round(custo_total, 2),
        "tempo_minutos": round(tempo_total_minutos),
        "horario_termino": horario_atual.strftime(
            "%d/%m/%Y %H:%M"
        ),
        "extrato": sessao_log
    }