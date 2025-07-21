import json

file_path = 'data/transfer-players-2026-merged.json'

# Load the JSON data
with open(file_path, 'r') as f:
    data = json.load(f)


# Get every unique field in the data
all_fields = set()
for entry in data:
    all_fields.update(entry.keys())

print("All fields in the data:")
for field in sorted(all_fields):
    print(field)

print("\nUnique values for 'role':")
roles = set(entry.get('role') for entry in data if 'role' in entry)
for role in sorted(roles):
    print(role)

print("\nUnique values for 'matchedTo':")
matched_to = set(entry.get('matchedTo') for entry in data if 'matchedTo' in entry)
for m in (matched_to):
    print(m)

# Get max height and weight
heights = [entry.get('height') for entry in data if 'height' in entry and isinstance(entry.get('height'), (int, float, str))]
weights = [entry.get('weight') for entry in data if 'weight' in entry and isinstance(entry.get('weight'), (int, float, str))]

# Convert to float if possible
heights = [float(h) for h in heights if h is not None and str(h).replace('.', '', 1).isdigit()]
weights = [float(w) for w in weights if w is not None and str(w).replace('.', '', 1).isdigit()]

max_height = max(heights) if heights else None
max_weight = max(weights) if weights else None

print(f"\nMax height: {max_height}")
print(f"Max weight: {max_weight}")
    
