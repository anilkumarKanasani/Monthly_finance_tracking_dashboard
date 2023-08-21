def transform_cc_bill():
    import pandas as pd
    df = pd.read_csv('~/Downloads/aktivitäten.csv', sep=';')
    # reverse the order of the rows
    df = df.iloc[::-1]
    # replace / with . in Datum column
    df['Datum'] = df['Datum'].str.replace('/', '.').str.replace('2023', '23')
    # replace , with . in Betrag column and covert to negative
    df['Betrag'] = df['Betrag'].str.replace(',', '.').astype(float)* -1
    df.to_csv('~/Downloads/processed.csv', sep=';')
    print("Sum of total expeses after Transofrmation :", df['Betrag'].sum())
    return None

if __name__ == "__main__":
    transform_cc_bill()