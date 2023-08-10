def create_dashboard(df):
    import streamlit as st
    import pandas as pd

    kpi_dict = dict(zip(df["Sub-category"], df["amount"]))
    kpi_percent_dict = dict(zip(df["Sub-category"], df["percentage"]))
    st.divider()
    (
        text_1_col,
        sal_col,
        Tax_less_income_col,
        PDP_income_col,
        Off_travel_income_col,
        Total_Income_pdp_col,
        Total_Income_col,
    ) = st.columns(7)
    total_gross_income = kpi_dict["Salary"] + kpi_dict["Tax less Income"]
    total_gross_income_per = (
        kpi_percent_dict["Salary"] + kpi_percent_dict["Tax less Income"]
    )
    text_1_col.subheader("Income Categories")
    sal_col.image("supporting_data/images/Salary.png", width=100)
    sal_col.metric(
        "Salary Income",
        round(kpi_dict["Salary"], 2),
        round(kpi_percent_dict["Salary"], 2),
    )
    Tax_less_income_col.image("supporting_data/images/Tax_less_income.png", width=100)
    Tax_less_income_col.metric(
        "Tax less Income",
        round(kpi_dict["Tax less Income"], 2),
        round(kpi_percent_dict["Tax less Income"], 2),
    )

    PDP_income_col.image("supporting_data/images/PDP_Income.png", width=100)
    PDP_income_col.metric(
        "PDP Income",
        round(kpi_dict["PDP Income"], 2),
        "Excluded from total & percentage calculation",
    )
    Off_travel_income_col.image("supporting_data/images/office_travel.png", width=100)
    Off_travel_income_col.metric(
        "Office Travel Income",
        round(kpi_dict["Office Travel Income"], 2),
        "Excluded from total & percentage calculation",
    )

    Total_Income_pdp_col.image("supporting_data/images/total_income.png", width=100)
    Total_Income_pdp_col.metric(
        "Total Gross + PDP Income",
        round(
            kpi_dict["Salary"]
            + kpi_dict["Tax less Income"]
            + kpi_dict["PDP Income"]
            + kpi_dict["Office Travel Income"],
            2,
        ),
    )
    Total_Income_col.image("supporting_data/images/total_income.png", width=100)
    Total_Income_col.metric(
        "Total Gross Income",
        round(
            total_gross_income,
            2,
        ),
        round(
            total_gross_income_per,
            2,
        ),
    )

    st.divider()

    (
        text_2_col,
        Income_Tax_col,
        Health_Insurance_col,
        Pension_col,
        Unemployment_fund_col,
        Nursing_care_col,
        Total_state_cut_col,
        net_income_col,
    ) = st.columns(8)

    text_2_col.subheader("State Cuttings Categories")
    Income_Tax_col.image("supporting_data/images/Income_tax.png", width=100)
    Income_Tax_col.metric(
        "Income Tax",
        round(kpi_dict["Tax"], 2),
        round(kpi_percent_dict["Tax"], 2),
    )
    Health_Insurance_col.image("supporting_data/images/health_insurance.png", width=100)
    Health_Insurance_col.metric(
        "Health Insurance",
        round(kpi_dict["Health Insurance"], 2),
        round(kpi_percent_dict["Health Insurance"], 2),
    )
    Pension_col.image("supporting_data/images/pension.png", width=100)
    Pension_col.metric(
        "Pension",
        round(kpi_dict["Pension"], 2),
        round(kpi_percent_dict["Pension"], 2),
    )
    Unemployment_fund_col.image(
        "supporting_data/images/unemplyment_fund.png", width=100
    )
    Unemployment_fund_col.metric(
        "Unemployment Fund",
        round(kpi_dict["Unemployment Fund"], 2),
        round(kpi_percent_dict["Unemployment Fund"], 2),
    )
    Nursing_care_col.image("supporting_data/images/health_insurance.png", width=100)
    Nursing_care_col.metric(
        "Nursing Care",
        round(kpi_dict["Nursing Care"], 2),
        round(kpi_percent_dict["Nursing Care"], 2),
    )
    total_state_cuttings = (
        kpi_dict["Tax"]
        + kpi_dict["Health Insurance"]
        + kpi_dict["Pension"]
        + kpi_dict["Unemployment Fund"]
        + kpi_dict["Nursing Care"]
    )
    total_state_cuttings_per = (
        kpi_percent_dict["Tax"]
        + kpi_percent_dict["Health Insurance"]
        + kpi_percent_dict["Pension"]
        + kpi_percent_dict["Unemployment Fund"]
        + kpi_percent_dict["Nursing Care"]
    )
    Total_state_cut_col.image("supporting_data/images/Total_cuttings.png", width=100)
    Total_state_cut_col.metric(
        "Total State Cuttings",
        round(
            total_state_cuttings,
            2,
        ),
        round(
            total_state_cuttings_per,
            2,
        ),
    )

    net_income_col.image("supporting_data/images/net_income.png", width=100)
    net_income_col.metric(
        "Total Net Income",
        round(total_gross_income - total_state_cuttings, 2),
        round(total_gross_income_per - total_state_cuttings_per, 2),
    )

    st.divider()

    tot_living_exp = (
        kpi_dict["Rent"]
        + kpi_dict["Phone & WiFi"]
        + kpi_dict["Groceries"]
        + kpi_dict["Travel Pass"]
        + kpi_dict["Gifts"]
    )

    tot_living_exp_per = (
        kpi_percent_dict["Rent"]
        + kpi_percent_dict["Phone & WiFi"]
        + kpi_percent_dict["Groceries"]
        + kpi_percent_dict["Travel Pass"]
        + kpi_percent_dict["Gifts"]
    )
    (
        text_3_col,
        Rent_col,
        Phne_wifi_col,
        Groceseries_col,
        Monthly_travel_col,
        Gifts_col,
        Total_living_exp_col,
    ) = st.columns(7)

    text_3_col.subheader("Living Expenses Categories")
    Rent_col.image("supporting_data/images/rent.png", width=100)
    Rent_col.metric(
        "Room Rent",
        round(kpi_dict["Rent"], 2),
        round(kpi_percent_dict["Rent"], 2),
    )
    Phne_wifi_col.image("supporting_data/images/cell_phone.png", width=100)
    Phne_wifi_col.metric(
        "Phone & WiFi",
        round(kpi_dict["Phone & WiFi"], 2),
        round(kpi_percent_dict["Phone & WiFi"], 2),
    )
    Groceseries_col.image("supporting_data/images/groceries.png", width=100)
    Groceseries_col.metric(
        "Groceseries",
        round(kpi_dict["Groceries"], 2),
        round(kpi_percent_dict["Groceries"], 2),
    )
    Monthly_travel_col.image("supporting_data/images/Monthly_travel.png", width=100)
    Monthly_travel_col.metric(
        "Monthly Travel",
        round(kpi_dict["Travel Pass"], 2),
        round(kpi_percent_dict["Travel Pass"], 2),
    )
    Gifts_col.image("supporting_data/images/unemplyment_fund.png", width=100)
    Gifts_col.metric(
        "Gifts", round(kpi_dict["Gifts"], 2), round(kpi_percent_dict["Gifts"], 2)
    )
    Total_living_exp_col.image("supporting_data/images/total_living.png", width=100)
    Total_living_exp_col.metric(
        "Total Living Expenses",
        round(tot_living_exp, 2),
        round(tot_living_exp_per, 2),
    )

    st.divider()

    tot_extra_exp = (
        kpi_dict["Entertainment"]
        + kpi_dict["Vacation"]
        + kpi_dict["Furnishings"]
        + kpi_dict["Family & Kids"]
        + kpi_dict["Restaurant"]
        + kpi_dict["Taxi"]
        + kpi_dict["Cloths"]
        + kpi_dict["Gym & Self grooming"]
    )

    tot_extra_exp_per = (
        kpi_percent_dict["Entertainment"]
        + kpi_percent_dict["Vacation"]
        + kpi_percent_dict["Furnishings"]
        + kpi_percent_dict["Family & Kids"]
        + kpi_percent_dict["Restaurant"]
        + kpi_percent_dict["Taxi"]
        + kpi_percent_dict["Cloths"]
        + kpi_percent_dict["Gym & Self grooming"]
    )
    (
        text_4_col,
        Entertainment_col,
        Furnishings_col,
        Family_Kids_col,
        Restaurant_col,
        Taxi_col,
        empt_2_col,
    ) = st.columns(7)

    text_4_col.subheader("Extra Expenses Categories")
    Entertainment_col.metric(
        "Entertainment & Vacation",
        round(kpi_dict["Entertainment"] + kpi_dict["Vacation"], 2),
        round(kpi_percent_dict["Entertainment"] + kpi_percent_dict["Vacation"], 2),
    )
    Furnishings_col.metric(
        "Furnishings",
        round(kpi_dict["Furnishings"], 2),
        round(kpi_percent_dict["Furnishings"], 2),
    )
    Family_Kids_col.metric(
        "Family & Kids",
        round(kpi_dict["Family & Kids"], 2),
        round(kpi_percent_dict["Family & Kids"], 2),
    )
    Restaurant_col.metric(
        "Restaurant",
        round(kpi_dict["Restaurant"], 2),
        round(kpi_percent_dict["Restaurant"], 2),
    )
    Taxi_col.metric(
        "Taxi", round(kpi_dict["Taxi"], 2), round(kpi_percent_dict["Taxi"], 2)
    )
    empt_2_col.image("supporting_data/images/total_living_extra.png", width=100)

    (
        empt_3_col,
        Cloths_col,
        gym_col,
        pdp_spent_col,
        office_travel_spent_col,
        tot_extra_expenses_col,
        tot_expenses_col,
    ) = st.columns(7)

    Cloths_col.metric("Cloths", round(kpi_dict["Cloths"], 2))
    gym_col.metric(
        "Gym & Self grooming",
        round(kpi_dict["Gym & Self grooming"], 2),
        round(kpi_percent_dict["Gym & Self grooming"], 2),
    )
    pdp_spent_col.metric(
        "PDP Spending",
        round(kpi_dict["PDP Spending"], 2),
        "Excluded from total & percentage calculation",
    )
    office_travel_spent_col.metric(
        "Office Travel Spending",
        round(kpi_dict["Office Travel Spending"], 2),
        "Excluded from total & percentage calculation",
    )
    tot_extra_expenses_col.metric(
        "Total Extra Expenses", round(tot_extra_exp, 2), round(tot_extra_exp_per, 2)
    )

    tot_expenses_col.metric(
        "Total Living & Extra Expenses",
        round(tot_living_exp + tot_extra_exp, 2),
        round(tot_living_exp_per + tot_extra_exp_per, 2),
    )

    st.divider()

    (
        text_5_col,
        Ind_savings_col,
        Europe_savings_col,
        empt_2_col,
        empt_3_col,
        empt_4_col,
        tot_savings_col,
    ) = st.columns(7)

    text_5_col.subheader("Savings Categories")
    Ind_savings_col.image("supporting_data/images/India_savings.png", width=100)
    Ind_savings_col.metric(
        "India Savings & Expenses",
        round(kpi_dict["To India"], 2),
        round(kpi_percent_dict["To India"], 2),
    )
    Europe_savings_col.image("supporting_data/images/Europe_savings.png", width=100)
    Europe_savings_col.metric(
        "Europe Long term savings",
        round(kpi_dict["Company Pension"], 2),
        round(kpi_percent_dict["Company Pension"], 2),
    )

    tot_savings_col.image("supporting_data/images/savings.png", width=100)
    tot_savings_col.metric(
        "Total savings",
        round(kpi_dict["To India"] + kpi_dict["Company Pension"], 2),
        round(kpi_percent_dict["To India"] + kpi_percent_dict["Company Pension"], 2),
    )
    st.divider()
