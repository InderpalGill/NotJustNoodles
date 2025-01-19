---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:

  name: "Not Just Noodles"
  text: "Because even students deserve a good meal"
  tagline: NWHacks 2025 Project

  actions:
    - theme: brand
      text: Jump to the project
      link: /project
---



<HorizontalContainer>
    <HorizontalCard
      title="Scan barcodes"
      excerpt="By scanning a barcode for a food item, you can add it to your inventory and use it to calculate your daily nutritional intake."
      image="https://upload.wikimedia.org/wikipedia/commons/b/bb/Lipu_tenpo_-_ISSN.png?20231114174320"
      url="./project"
      :hideCategory="true"
      :hideAuthor="true"
      titleLines="5"
      excerptLines="5"
    />
    <HorizontalCard
      title="Search from a large database of food items"
      excerpt="You can search for food items by name and select from a list of suggestions. You can then add the exact amount of the food item to your inventory."
      image="https://images.unsplash.com/photo-1498837167922-ddd27525d352"
      url="./project"
      :hideCategory="true"
      :hideAuthor="true"
      titleLines="5"
      excerptLines="5"
    />
    <HorizontalCard
      title="Track by day"
      excerpt="Make an account and keep track of your nutritional intake each day, and compare it to your daily recommended intake."
      image="https://images.unsplash.com/photo-1494390248081-4e521a5940db"
      url="./project"
      :hideCategory="true"
      :hideAuthor="true"
      titleLines="5"
      excerptLines="5"
    />
  </HorizontalContainer>