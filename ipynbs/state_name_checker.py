import pandas as pd
import geopandas as gpd

df_csv = pd.read_csv('/RHS_2015_ch-1_table_2a.csv')
state_column_csv = 'India / State/ Union Territory'
unique_states_csv = df_csv[state_column_csv].unique().tolist()
print(f"Unique states from CSV: {unique_states_csv}")

gdf_geojson = gpd.read_file('/INDIA_STATES.geojson')
state_column_geojson = 'STNAME'
unique_states_geojson = gdf_geojson[state_column_geojson].unique().tolist()
print(f"Unique states from GeoJSON: {unique_states_geojson}")

unique_states_csv_normalized = [state.upper() for state in unique_states_csv]
unique_states_geojson_normalized = [state.upper() for state in unique_states_geojson]

set_csv = set(unique_states_csv_normalized)
set_geojson = set(unique_states_geojson_normalized)

common_states = list(set_csv.intersection(set_geojson))
unique_to_csv = list(set_csv.difference(set_geojson))
unique_to_geojson = list(set_geojson.difference(set_csv))

print(f"Common state names: {common_states}")
print(f"State names unique to CSV: {unique_to_csv}")
print(f"State names unique to GeoJSON: {unique_to_geojson}")
