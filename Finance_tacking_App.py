import streamlit as st
import altair as alt

st.set_page_config(layout="wide")

# Header
st.header("Overa all Yearly KPIs")


import pandas as pd

df_kpi = pd.read_csv("intermediate_cache/KPIs.csv", sep=";")
df_kpi["amount"] = df_kpi["amount"].apply(lambda x: round(x, 2))


kpi_dict = dict(zip(df_kpi.Category, df_kpi.amount))

(
    gross_sal_col,
    Income_Tax_col,
    Health_insu_col,
    pension_col,
    charity_col,
    net_sal_col,
    living_exp_col,
    extra_exp_col,
    PDP_exp_col,
    India_savings_col,
    europe_savings_col,
) = st.columns(11)


gross_sal_col.metric(
    "Total Gross Salary",
    round(kpi_dict["Salary"] + kpi_dict["Extra Income"], 2),
)
Income_Tax_col.metric("Tax Paid", kpi_dict["Income Tax"])
Health_insu_col.metric("Health Insurance Paid", kpi_dict["Health Insurance"])
pension_col.metric("Pension Paid", kpi_dict["Pension"])
charity_col.metric("Charity Paid", kpi_dict["Charity"])
net_sal_col.metric("Total Net Salary", "TBC")
living_exp_col.metric("Living Expenses", kpi_dict["Living Expenses"])
extra_exp_col.metric("Extra Expenses", kpi_dict["Extra Expenses"])
PDP_exp_col.metric("PDP Expenses", kpi_dict["PDP Expenses"])
India_savings_col.metric("To India", kpi_dict["India Savings"])
europe_savings_col.metric("Europe Savings", kpi_dict["Europe Savings"])


df_monthly_bars = pd.read_csv("intermediate_cache/monthly_bars.csv", sep=";")
monthly_sorter = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
]


income_df = df_monthly_bars[df_monthly_bars["Category Type"].isin(["Income"])]
col1, col2 = st.columns(2)
with col1:
    st.header("Monthly Gross Income")
    st.altair_chart(
        alt.Chart(income_df)
        .mark_bar()
        .encode(
            x=alt.X("month", sort=monthly_sorter),
            y=alt.Y("amount", axis=None),
            color=alt.value("green"),
        )
        .properties(width=800, height=500),
        use_container_width=True,
    )

state_cuttings_df = df_monthly_bars[
    df_monthly_bars["Category Type"].isin(["State Cuttings"])
]

with col2:
    st.header("Monthly Automatic Cuttings")
    st.altair_chart(
        alt.Chart(state_cuttings_df)
        .mark_bar()
        .encode(
            x=alt.X("month", sort=monthly_sorter),
            y=alt.Y("amount", axis=None),
            color=alt.value("orange"),
        )
        .properties(width=800, height=500),
        use_container_width=True,
    )

st.divider()

expenses_df = df_monthly_bars[df_monthly_bars["Category Type"].isin(["Expense"])]
col1, col2 = st.columns(2)
with col1:
    st.header("Monthly overall Expenses")
    st.altair_chart(
        alt.Chart(expenses_df)
        .mark_bar()
        .encode(
            x=alt.X("month", sort=monthly_sorter),
            y=alt.Y("amount", axis=None),
            color=alt.value("orange"),
        )
        .properties(width=800, height=500),
        use_container_width=True,
    )

savings_df = df_monthly_bars[df_monthly_bars["Category Type"].isin(["Savings"])]
with col2:
    st.header("Monthly overall Savings")
    st.altair_chart(
        alt.Chart(savings_df)
        .mark_bar()
        .encode(
            x=alt.X("month", sort=monthly_sorter),
            y=alt.Y("amount", axis=None),
            color=alt.value("green"),
        )
        .properties(width=800, height=500),
        use_container_width=True,
    )
