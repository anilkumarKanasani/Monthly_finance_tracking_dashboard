import streamlit as st
import pandas as pd
from dash_baord_function import create_dashboard

tabs_names_list = [
    "Overall_year",
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
st.set_page_config(layout="wide")

(
    overall_tab,
    Jan_tab,
    Feb_tab,
    Mar_tab,
    Apr_tab,
    May_tab,
    Jun_tab,
    Jul_tab,
    Aug_tab,
    Sep_tab,
    Oct_tab,
    Nov_tab,
    Dec_tab,
) = st.tabs(tabs_names_list)

yearly_df = pd.read_csv("processed_data/yearly_detailed_metrics.csv", sep=";")
monthly_df = pd.read_csv("processed_data/monthly_detailed_metrics.csv", sep=";")

all_transactions_df = pd.read_csv("processed_data/all_transactions.csv", sep=";")
coupons_df = pd.read_csv("processed_data/2023/100_coupons.csv", sep=";").set_index(
    "Unnamed: 0"
)
coupons_df = coupons_df.round(2)

with overall_tab:
    st.header("Anil Kumar Kanasani's  2023 Year Income, Savings & Expenses")
    create_dashboard(
        df=yearly_df,
        gift_coupon_utilized=coupons_df.loc["Total"].values[0],
        gift_coupon_balance=coupons_df.loc["December"].values[1],
        special_case=True,
    )

for tab, month in zip(
    [
        Jan_tab,
        Feb_tab,
        Mar_tab,
        Apr_tab,
        May_tab,
        Jun_tab,
        Jul_tab,
        Aug_tab,
        Sep_tab,
        Oct_tab,
        Nov_tab,
        Dec_tab,
    ],
    tabs_names_list[1:],
):
    current_month_df = monthly_df[monthly_df["month"] == month].copy()
    with tab:
        st.header("Anil Kumar Kanasani's " + month + " 2023 Month Detailed Breakdown")
        if month == "January":
            create_dashboard(
                df=current_month_df,
                gift_coupon_utilized=coupons_df.loc[month].values[0],
                gift_coupon_balance=coupons_df.loc[month].values[1],
                special_case=True,
            )
        else:
            create_dashboard(
                df=current_month_df,
                gift_coupon_utilized=coupons_df.loc[month].values[0],
                gift_coupon_balance=coupons_df.loc[month].values[1],
                special_case=False,
            )
