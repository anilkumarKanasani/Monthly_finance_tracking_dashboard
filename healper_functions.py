def transform_cc_bill():
    import pandas as pd
    df = pd.read_csv('~/Downloads/activity.csv', sep=';')
    # reverse the order of the rows
    df = df.iloc[::-1]
    # replace / with . in Datum column
    df['Datum'] = df['Datum'].str.replace('/', '.').str.replace('2024', '24')
    # extract first word from Beschreibung
    df['Beschreibung'] = df['Beschreibung'].str.split().str[0]
    # replace , with . in Betrag column and covert to negative
    df['Betrag'] = df['Betrag'].str.replace(',', '.').astype(float)* -1
    # rename column names
    df.rename(columns={'Beschreibung': 'Description',
                       'Betrag': 'amount'}, inplace=True)
    df['Sub-category'] = "  "
    # re order the columns
    df = df[['Datum', 'Description', 'Sub-category', 'amount']]
    df.to_csv('~/Downloads/processed.csv', sep=';')
    print("Sum of total expeses after Transofrmation :", df['amount'].sum())
    return None

if __name__ == "__main__":
    transform_cc_bill()