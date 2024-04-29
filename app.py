import streamlit as st
import pandas as pd
import gspread
from dash_baord_function import create_dashboard

gc = gspread.service_account(filename="./credentials.json")
wk_sht = gc.open("Expenses_app_db")

tabs_names_list = [
    "Overall_year",
    "January",
    "February",
    "March",
    "April",
    # "May",
    # "June",
    # "July",
    # "August",
    # "September",
    # "October",
    # "November",
    # "December",
    "Analysis_requests",
]
st.set_page_config(layout="wide")

(
    overall_tab,
    Jan_tab,
    Feb_tab,
    Mar_tab,
    Apr_tab,
    # May_tab,
    # Jun_tab,
    # Jul_tab,
    # Aug_tab,
    # Sep_tab,
    # Oct_tab,
    # Nov_tab,
    # Dec_tab,
    analysis_tab,
) = st.tabs(tabs_names_list)


yearly_df = pd.DataFrame(wk_sht.worksheet("Yearly_detailed_metrics").get_all_records())
monthly_df = pd.DataFrame(wk_sht.worksheet("Monthly_detailed_metrics").get_all_records())
coupons_df = pd.DataFrame(wk_sht.worksheet("Coupon_metrics").get_all_records()).round(2)

yearly_df['Sub-category_copy'] = yearly_df['Sub-category']
yearly_df.set_index('Sub-category_copy', inplace=True)

monthly_df['Sub-category_copy'] = monthly_df['Sub-category']
monthly_df.set_index('Sub-category_copy', inplace=True)

coupons_df['index_copy'] = coupons_df['index']
coupons_df.set_index('index_copy', inplace=True)


with overall_tab:
    st.header("Anil Kumar Kanasani's  2024 Year Income, Savings & Expenses")
    create_dashboard(
        df=yearly_df,
        gift_coupon_utilized=coupons_df.loc["Total"].values[1],
        gift_coupon_balance=coupons_df.loc["December"].values[2],
        special_case=True,
    )

for tab, month in zip(
    [
        Jan_tab,
        Feb_tab,
        Mar_tab,
        Apr_tab,
        # May_tab,
        # Jun_tab,
        # Jul_tab,
        # Aug_tab,
        # Sep_tab,
        # Oct_tab,
        # Nov_tab,
        # Dec_tab,
    ],
    tabs_names_list[1:],
):
    current_month_df = monthly_df[monthly_df["month"] == month].copy()
    with tab:
        st.header("Anil Kumar Kanasani's " + month + " 2024 Month Detailed Breakdown")
        if month == "January":
            create_dashboard(
                df=current_month_df,
                gift_coupon_utilized=coupons_df.loc[month].values[1],
                gift_coupon_balance=coupons_df.loc[month].values[2],
                special_case=True,
            )
        else:
            create_dashboard(
                df=current_month_df,
                gift_coupon_utilized=coupons_df.loc[month].values[1],
                gift_coupon_balance=coupons_df.loc[month].values[2],
                special_case=False,
            )

with analysis_tab:
    st.header("Analysis of all year income and spendings")
    month_selection, category_selection = st.columns(2)
    with category_selection:
        selected_category = st.radio(
            "Selecte a category to analyse",
            [
                "total_gross_income",
                "total_net_income",
                "tot_living_exp",
                "tot_extra_exp",
                "To India",
            ],
        )

    df_temp = monthly_df[monthly_df["Sub-category"] == selected_category].copy()
    st.dataframe(df_temp)
    st.line_chart(df_temp["amount"])
