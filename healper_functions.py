def refactor_monthly_data_frame(data_frame_location):
    print("Refactoring ", data_frame_location, " as per project requirement")
    import pandas as pd

    df = pd.read_csv(data_frame_location, sep=";")
    df["Credit"] = df["Credit"].astype(str).str.replace(",", ".").astype(float)
    df["Debit"] = df["Debit"].astype(str).str.replace(",", ".").astype(float)

    df = df.fillna(0)
    df["Date"] = pd.to_datetime(df["Date"], format="%d.%m.%y")

    df.to_csv(data_frame_location, sep=";", index=False)
    print("Refactoring of ", data_frame_location, " is completed !! ")
    return None
