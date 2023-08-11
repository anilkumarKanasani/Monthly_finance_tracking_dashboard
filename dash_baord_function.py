def create_dashboard(df):
    import streamlit as st
    import pandas as pd

    df = df.round(2)

    kpi = dict(zip(df["Sub-category"], df["amount"]))
    kpi_perc = dict(zip(df["Sub-category"], df["percentage"]))

    st.divider()
    # Income Category columns
    (
        text_1_col,
        sal_col,
        Tax_less_income_col,
        PDP_income_col,
        Off_travel_income_col,
        Total_Income_pdp_col,
        Total_Income_col,
    ) = st.columns(7)

    text_1_col.subheader("Income Categories")
    sal_col.image("supporting_data/images/Salary.png", width=100)
    sal_col.metric(
        "Salary Income",
        kpi["Salary"],
        kpi_perc["Salary"],
    )
    Tax_less_income_col.image("supporting_data/images/Tax_less_income.png", width=100)
    Tax_less_income_col.metric(
        "Tax less Income",
        kpi["Tax less Income"],
        kpi_perc["Tax less Income"],
    )

    PDP_income_col.image("supporting_data/images/PDP_Income.png", width=100)
    PDP_income_col.metric(
        "PDP Income",
        kpi["PDP Income"],
        "Excluded from total & percentage calculation",
    )
    Off_travel_income_col.image("supporting_data/images/office_travel.png", width=100)
    Off_travel_income_col.metric(
        "Office Travel Income",
        kpi["Office Travel Income"],
        "Excluded from total & percentage calculation",
    )

    Total_Income_pdp_col.image("supporting_data/images/total_income.png", width=100)
    Total_Income_pdp_col.metric(
        "Total Gross + PDP Income",
        kpi["total_gross_income_pdp"],
    )
    Total_Income_col.image("supporting_data/images/total_income.png", width=100)
    Total_Income_col.metric(
        "Total Gross Income",
        kpi["total_gross_income"],
        kpi_perc["total_gross_income"],
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
        kpi["Tax"],
        kpi_perc["Tax"],
    )
    Health_Insurance_col.image("supporting_data/images/health_insurance.png", width=100)
    Health_Insurance_col.metric(
        "Health Insurance",
        kpi["Health Insurance"],
        kpi_perc["Health Insurance"],
    )
    Pension_col.image("supporting_data/images/pension.png", width=100)
    Pension_col.metric(
        "Pension",
        kpi["Pension"],
        kpi_perc["Pension"],
    )
    Unemployment_fund_col.image(
        "supporting_data/images/unemplyment_fund.png", width=100
    )
    Unemployment_fund_col.metric(
        "Unemployment Fund",
        kpi["Unemployment Fund"],
        kpi_perc["Unemployment Fund"],
    )
    Nursing_care_col.image("supporting_data/images/health_insurance.png", width=100)
    Nursing_care_col.metric(
        "Nursing Care",
        kpi["Nursing Care"],
        kpi_perc["Nursing Care"],
    )

    Total_state_cut_col.image("supporting_data/images/Total_cuttings.png", width=100)
    Total_state_cut_col.metric(
        "Total State Cuttings",
        kpi["total_state_cuttings"],
        kpi_perc["total_state_cuttings"],
    )

    net_income_col.image("supporting_data/images/net_income.png", width=100)
    net_income_col.metric(
        "Total Net Income",
        kpi["total_net_income"],
        kpi_perc["total_net_income"],
    )

    st.divider()

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
        kpi["Rent"],
        kpi_perc["Rent"],
    )
    Phne_wifi_col.image("supporting_data/images/cell_phone.png", width=100)
    Phne_wifi_col.metric(
        "Phone & WiFi",
        kpi["Phone & WiFi"],
        kpi_perc["Phone & WiFi"],
    )
    Groceseries_col.image("supporting_data/images/groceries.png", width=100)
    Groceseries_col.metric(
        "Groceseries",
        kpi["Groceries"],
        kpi_perc["Groceries"],
    )
    Monthly_travel_col.image("supporting_data/images/Monthly_travel.png", width=100)
    Monthly_travel_col.metric(
        "Monthly Travel",
        kpi["Travel Pass"],
        kpi_perc["Travel Pass"],
    )
    Gifts_col.image("supporting_data/images/unemplyment_fund.png", width=100)
    Gifts_col.metric("Gifts", kpi["Gifts"], kpi_perc["Gifts"])
    Total_living_exp_col.image("supporting_data/images/total_living.png", width=100)
    Total_living_exp_col.metric(
        "Total Living Expenses",
        kpi["tot_living_exp"],
        kpi_perc["tot_living_exp"],
    )

    st.divider()

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
        kpi["Entertainment"] + kpi["Vacation"],
        kpi_perc["Entertainment"] + kpi_perc["Vacation"],
    )
    Furnishings_col.metric(
        "Furnishings",
        kpi["Furnishings"],
        kpi_perc["Furnishings"],
    )
    Family_Kids_col.metric(
        "Family & Kids",
        kpi["Family & Kids"],
        kpi_perc["Family & Kids"],
    )
    Restaurant_col.metric(
        "Restaurant",
        kpi["Restaurant"],
        kpi_perc["Restaurant"],
    )
    Taxi_col.metric("Taxi", kpi["Taxi"], kpi_perc["Taxi"])
    empt_2_col.image("supporting_data/images/total_living_extra.png", width=100)

    (
        empt_col,
        Cloths_col,
        gym_col,
        pdp_spent_col,
        office_travel_spent_col,
        tot_extra_expenses_col,
        tot_expenses_col,
    ) = st.columns(7)

    Cloths_col.metric("Cloths", kpi["Cloths"])
    gym_col.metric(
        "Gym & Self grooming",
        kpi["Gym & Self grooming"],
        kpi_perc["Gym & Self grooming"],
    )
    pdp_spent_col.metric(
        "PDP Spending",
        kpi["PDP Spending"],
        "Excluded from total & percentage calculation",
    )
    office_travel_spent_col.metric(
        "Office Travel Spending",
        kpi["Office Travel Spending"],
        "Excluded from total & percentage calculation",
    )
    tot_extra_expenses_col.metric(
        "Total Extra Expenses",
        kpi["tot_extra_exp"],
        kpi_perc["tot_extra_exp"],
    )

    tot_expenses_col.metric(
        "Total Living & Extra Expenses",
        kpi["complete_expenses"],
        kpi_perc["complete_expenses"],
    )

    st.divider()

    (
        text_5_col,
        Ind_savings_col,
        Europe_savings_col,
        empt_col,
        empt_col,
        empt_col,
        tot_savings_col,
    ) = st.columns(7)

    text_5_col.subheader("Savings Categories")
    Ind_savings_col.image("supporting_data/images/India_savings.png", width=100)
    Ind_savings_col.metric(
        "India Savings & Expenses",
        kpi["To India"],
        kpi_perc["To India"],
    )
    Europe_savings_col.image("supporting_data/images/Europe_savings.png", width=100)
    Europe_savings_col.metric(
        "Europe Long term savings",
        kpi["Company Pension"],
        kpi_perc["Company Pension"],
    )

    tot_savings_col.image("supporting_data/images/savings.png", width=100)
    tot_savings_col.metric(
        "Total savings",
        kpi["total_savings"],
        kpi_perc["total_savings"],
    )
    st.divider()
