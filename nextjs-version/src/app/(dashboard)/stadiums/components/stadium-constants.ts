export const SURFACE_TYPES = [
    { label: "Tabiiy chim", value: "grass" },
    { label: "Sun'iy chim", value: "artificial" },
] as const;

export const CAPACITY_TYPES = [
    { label: "5x5", value: "5x5" },
    { label: "6x6", value: "6x6" },
    { label: "7x7", value: "7x7" },
    { label: "8x8", value: "8x8" },
    { label: "9x9", value: "9x9" },
    { label: "10x10", value: "10x10" },
    { label: "11x11", value: "11x11" },
] as const;

export const ROOF_TYPES = [
    { label: "Ochiq", value: "open" },
    { label: "Yopiq", value: "covered" },
] as const;

export const METRO_STATIONS = [
    // Chilonzor Line (Red Line)
    { label: "Buyuk Ipak Yoli", value: "Buyuk Ipak Yoli" },
    { label: "Pushkin", value: "Pushkin" },
    { label: "Hamid Olimjon", value: "Hamid Olimjon" },
    { label: "Amir Temur Xiyoboni", value: "Amir Temur Xiyoboni" },
    { label: "Mustaqillik Maydoni", value: "Mustaqillik Maydoni" },
    { label: "Paxtakor", value: "Paxtakor" },
    { label: "Xalqlar Doʻstligi", value: "Xalqlar Doʻstligi" },
    { label: "Milliy Bogʻ", value: "Milliy Bogʻ" },
    { label: "Novza", value: "Novza" },
    { label: "Mirzo Ulugʻbek", value: "Mirzo Ulugʻbek" },
    { label: "Chilonzor", value: "Chilonzor" },
    { label: "Olmazor", value: "Olmazor" },
    { label: "Choshtepa", value: "Choshtepa" },
    { label: "O'zgarish", value: "O'zgarish" },
    { label: "Sirg'ali", value: "Sirg'ali" },
    { label: "Yangihayot", value: "Yangihayot" },
    { label: "Chinor", value: "Chinor" },

    // O'zbekiston Line (Blue Line)
    { label: "Beruniy", value: "Beruniy" },
    { label: "Tinchlik", value: "Tinchlik" },
    { label: "Chorsu", value: "Chorsu" },
    { label: "G'afur G'ulom", value: "G'afur G'ulom" },
    { label: "Alisher Navoiy", value: "Alisher Navoiy" },
    { label: "O'zbekiston", value: "O'zbekiston" },
    { label: "Kosmonavtlar", value: "Kosmonavtlar" },
    { label: "Oybek", value: "Oybek" },
    { label: "Toshkent", value: "Toshkent" },
    { label: "Mashinasozlar", value: "Mashinasozlar" },
    { label: "Do'stlik", value: "Do'stlik" },

    // Yunusobod Line (Green Line)
    { label: "Turkiston", value: "Turkiston" },
    { label: "Yunusobod", value: "Yunusobod" },
    { label: "Shahriston", value: "Shahriston" },
    { label: "Bodomzor", value: "Bodomzor" },
    { label: "Minor", value: "Minor" },
    { label: "Abdulla Qodirii", value: "Abdulla Qodirii" },
    { label: "Yunus Rajabiy", value: "Yunus Rajabiy" },
    { label: "Ming O'rik", value: "Ming O'rik" },

    // Circle Line (O'ttiz Yillik Mustaqillik)
    { label: "Texnopark", value: "Texnopark" },
    { label: "Yashnobod", value: "Yashnobod" },
    { label: "Tuzel", value: "Tuzel" },
    { label: "Olmos", value: "Olmos" },
    { label: "Rohat", value: "Rohat" },
    { label: "Yangiobod", value: "Yangiobod" },
    { label: "Qo'yliq", value: "Qo'yliq" },
    { label: "Matonat", value: "Matonat" },
    { label: "Qiyot", value: "Qiyot" },
    { label: "Tolariq", value: "Tolariq" },
    { label: "Xonobod", value: "Xonobod" },
    { label: "Quruvchilar", value: "Quruvchilar" },
    { label: "Turon", value: "Turon" },
    { label: "Qipchoq", value: "Qipchoq" },
] as const;

export const LANDMARK_TYPES = [
    { label: "Metro bekati", value: "subway", amenity: "station", overpass: '["railway"="station"]["station"="subway"]' },
    { label: "Kafe", value: "cafe", amenity: "cafe", overpass: '["amenity"="cafe"]' },
    { label: "Restoran", value: "restaurant", amenity: "restaurant", overpass: '["amenity"="restaurant"]' },
    { label: "Bozor", value: "marketplace", amenity: "marketplace", overpass: '["amenity"="marketplace"]' },
    { label: "Masjid", value: "place_of_worship", amenity: "place_of_worship", overpass: '["amenity"="place_of_worship"]["religion"="muslim"]' },
    { label: "Maktab", value: "school", amenity: "school", overpass: '["amenity"="school"]' },
    { label: "Kasalxona", value: "hospital", amenity: "hospital", overpass: '["amenity"="hospital"]' },
    { label: "Bog' / Park", value: "park", amenity: "park", overpass: '["leisure"="park"]' },
] as const;
