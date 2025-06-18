const feedbackContents = [
  "Excellent service! Friendly and responsive staff.",
  "The hotel is clean, well-equipped, and very comfortable.",
  "Delicious breakfast, room with a beautiful and airy view.",
  "A memorable experience, I will come back next time!",
  "Reasonable price, central location convenient for travel.",
  "Clean swimming pool, warm water, and a great view.",
  "Spacious, quiet room with a very comfortable bed.",
  "The hotel's restaurant serves very delicious food.",
  "The reception area works very professionally and efficiently.",
  "The hotel is close to famous tourist attractions, very convenient.",
  "Fast check-in and check-out process, very time-saving.",
  "The staff gave great recommendations for local restaurants.",
  "Wi-Fi connection is strong and stable throughout the hotel.",
  "Room service was prompt and attentive to details.",
  "Beautiful decor, creating a cozy atmosphere.",
  "Comfortable lounge area for relaxing and reading.",
  "The spa services were top-notch and relaxing.",
  "Parking was convenient and secure.",
  "Pet-friendly hotel, which was perfect for our family.",
  "Great value for money, exceeded our expectations.",
  "The bar had a great selection of cocktails.",
  "Air conditioning worked perfectly, keeping the room cool.",
  "Friendly housekeeping staff, always keeping the room tidy.",
  "Lovely garden area to enjoy morning coffee.",
  "Soundproof rooms, ensuring a peaceful night's sleep.",
  "The hotel arranged an excellent airport transfer.",
  "Fitness center is well-equipped and clean.",
  "Staff always greeted us with a smile.",
  "Kids' play area was safe and fun.",
  "Beautiful sunset view from the rooftop terrace.",
];

const roomNames = [
  "Deluxe Sea View Room",
  "Superior City View Room",
  "Standard Double Bed Room",
  "Premium Family Room",
  "Luxury Presidential Suite",
  "First-Class Executive Room",
  "Budget Room for Couples",
  "Premium Room with Balcony",
  "Classic Room with Wooden Interior",
  "Lakeside Resort Room",
  "First-Class VIP Room",
  "Premium Resort Room",
  "Presidential Room",
  "Budget Room",
  "Studio Apartment Room",
  "Family Room for 4 People",
  "Lake View Room",
  "City View Room",
  "Premium Single Bed Room",
  "Luxury Suite Room",
];

const hotelDescriptions = [
  `Located in the heart of the city, our hotel invites you to experience a luxurious escape unlike any other. With world-class amenities and personalized service, we offer comfort and elegance in every corner.\n\nEnjoy exquisite cuisine crafted by renowned chefs and unwind in our beautifully designed rooms. Whether you're staying for a night or a week, we make every moment memorable.\n\nPerfect for both business and leisure travelers, the hotel provides panoramic city views and seamless access to nearby attractions and events.`,
  `Experience the magnificent beauty of royal luxury at its finest. Our hotel is adorned with elegant décor, grand architecture, and thoughtful touches that reflect timeless sophistication.\n\nEach suite is designed for comfort and class, featuring premium bedding, marble bathrooms, and personalized butler service. Enjoy refined dining in our gourmet restaurants that celebrate global flavors.\n\nRejuvenate your body and soul in our exclusive spa and wellness center. Whether you're here to relax or explore, every moment is carefully curated to delight.`,
  `Escape to a peaceful retreat hidden within the city's vibrant rhythm. Our hotel blends tranquility and modernity, offering a unique haven for guests seeking quiet elegance.\n\nLush rooftop gardens, soothing interior design, and thoughtfully crafted rooms create an atmosphere of calm and relaxation.\n\nSpend your days enjoying in-room entertainment, sipping tea under the stars, or participating in local cultural experiences tailored for peaceful minds.`,
  "A beachside paradise where guests can wake up to the sound of waves and witness stunning sunrises. Our seaside resort features infinity pools, luxurious spa treatments, and various water sports to provide a memorable beach vacation.",
  `Welcome to a beachside paradise where sunrises paint the ocean in gold and the rhythm of the waves brings peace to your soul. Our resort is perfectly located along pristine shores for the ultimate tropical escape.\n\nEnjoy infinity pools, luxurious beachfront villas, and spa treatments that soothe every sense. Whether you're lounging by the water or exploring marine life, there's always something to experience.\n\nFrom thrilling water sports to serene beach walks, our resort blends adventure and relaxation into one unforgettable vacation.`,
  `Soar above the city in a high-rise haven offering jaw-dropping skyline views and world-class comfort. Our modern hotel towers over the landscape, offering a truly elevated stay.\n\nSpacious suites with floor-to-ceiling windows, a rooftop bar with handcrafted cocktails, and a stylish lounge area provide everything you need to relax and enjoy the view.\n\nLocated in the heart of the metropolis, this is the perfect blend of sophistication and convenience — where your urban lifestyle meets refined luxury.`,
  "A perfect blend of comfort and style, our hotel offers a warm and welcoming space for both tourists and business travelers. Enjoy a modern fitness center, relaxing spa treatments, and fine dining prepared by top chefs.",
  "Defining the gold standard of premium hospitality, our hotel combines classic beauty with modern luxury. Each room is meticulously designed with luxurious furnishings, and our signature services ensure an excellent stay.",
  "An urban oasis for modern travelers seeking both relaxation and adventure. With contemporary design, cutting-edge facilities, and convenient location near city attractions, our hotel is the ideal choice for a memorable stay.",
  "A royal experience awaits you at our lush garden resort, where you can immerse yourself in peace and luxury. With elegantly designed grounds, award-winning spa, and world-class cuisine, our hotel is the ideal retreat for discerning guests.",
  "Discover a mountain retreat where fresh air, spectacular scenery, and cozy accommodations create a perfect getaway. Enjoy hiking trips, evening campfires, and rustic beauty at our resort.",
  "Step into a world of modern elegance at our stylish boutique hotel. Designed with contemporary interiors, high-tech amenities, and personalized service, it's perfect for urban travelers.",
  "Our lakeside resort offers an enchanting vacation with picturesque settings, water sports, and premium lakeside dining. Whether it's a romantic getaway or family travel, this is the perfect place to unwind.",
  "Enjoy a memorable desert vacation with luxury tents, camel rides, and mesmerizing stargazing nights. Our oasis resort brings the magic of sand dunes with exclusive experiences.",
  "Experience the blend of historical charm and modern luxury at our heritage hotel. With carefully preserved architecture and top-tier service, it's a culturally rich and comfortable stay.",
  "A charming countryside retreat where lush green hills, fresh air, and rustic wooden cabins create a peaceful haven away from city noise. Enjoy farm-to-table cuisine and leisurely strolls through nature.",
  "An exclusive private island paradise with private villas, crystal-clear waters, and world-class spa treatments. A true escape for those seeking privacy and serenity.",
  "A unique ski resort with cozy wooden cabins, challenging slopes, and luxurious après-ski services. Perfect for winter sports enthusiasts.",
  "A cultural gem offering deep local experiences, from traditional performances to hands-on cooking classes. Stay with us and discover the living heritage essence of this land.",
  "A wellness-focused resort prioritizing your health and relaxation. With yoga retreats, organic cuisine, and comprehensive spa therapies to rejuvenate body and mind.",
  "A futuristic hotel combining technology and luxury. Smart rooms, AI services, and ultra-modern architecture provide a one-of-a-kind experience.",
  "A luxurious casino hotel where the excitement never stops. Enjoy world-class gaming, spectacular entertainment shows, and fine dining under one magnificent roof.",
  "An eco-friendly retreat for travelers who love sustainability without sacrificing luxury. Solar-powered rooms, organic cuisine, and green initiatives await you.",
  "An underwater hotel where you can see the beautiful ocean world right from your room window—truly a unique experience.",
  "A vintage-style hotel inspired by the 1920s, offering a journey back to the golden age of luxury, with jazz lounges and classic decor.",
  "A space-themed hotel taking you on an intergalactic journey with futuristic design, floating beds, and authentic space experiences.",
  "A Hobbit-style hotel where every detail is inspired by the fantasy world—perfect for fans of mystical adventures.",
  "A retro-style hotel bringing the 60s, 70s, and 80s back to life with nostalgic interiors, music, and vintage atmosphere.",
  "Located in the city center, our hotel offers a luxurious experience with world-class amenities, fine dining, and personalized service.",
  "Experience the luxury of royal style with our premium services. From magnificent suites to refined cuisine, every detail is carefully crafted.",
  "A peaceful resort providing tranquility amidst the bustling city. The hotel features elegantly decorated rooms, a rooftop garden, and various entertainment activities.",
  "A beachside paradise where guests wake up to the sound of waves and witness beautiful sunrises. A seaside resort with infinity pools and luxurious spa treatments.",
  "A high-rise building offering spectacular panoramic views. Whether you're enjoying drinks at the rooftop bar or relaxing in your room, the hotel always ensures comfort and convenience.",
  "A premium experience for travelers seeking luxury. The hotel provides VIP lounges, high-end restaurants, and personal support services.",
  "The hotel perfectly combines comfort and style, providing a cozy space for both tourists and business travelers.",
  "Redefining luxury with meticulously designed rooms, modern furnishings, and attentive customer service.",
  "An urban sanctuary for modern travelers. Contemporary design, top amenities, and convenient location.",
  "A royal experience at a lush garden resort where guests can enjoy absolute tranquility.",
  "Discover a mountain vacation with fresh air, spectacular scenery, and cozy rooms.",
  "A stylish boutique hotel with luxurious decor, high-tech amenities, and personalized service.",
  "A lakeside resort offering a wonderful vacation with romantic scenery, water sports, and lakeside dining.",
  "An oasis in the desert with luxury tents, camel riding, and beautiful starry nights.",
  "Experience classic charm in a heritage hotel where traditional architecture combines with modern convenience.",
  "A peaceful countryside resort among lush hills, providing the perfect relaxation space.",
  "A paradise island with private villas, crystal-clear seawater, and world-class spa treatments.",
  "An excellent ski resort with cozy wooden cabins and world-class slopes.",
  "A cultural destination with rich local experiences, from traditional performances to cooking classes.",
  "A wellness-focused resort with detox programs, yoga, and comprehensive spa services.",
  "A modern hotel combining advanced technology, smart rooms, and convenient AI services.",
  "A luxurious casino hotel offering world-class entertainment experiences with games and captivating performances.",
  "An eco-resort for nature-loving travelers, using renewable energy and organic ingredients.",
  "A vacation at a vineyard with vast fields of grapes and premium wine tasting experiences.",
  "A lodge in the rainforest where guests can participate in safaris and observe wildlife.",
  "A floating hotel offering a unique experience on a luxury yacht.",
  "An ancient castle renovated into a luxurious hotel where guests can enjoy authentic royal spaces.",
  "An Arctic lodge where you can admire the Northern Lights from a warm glass cabin.",
  "An art-style hotel where each room is a unique work of art.",
  "Experience a traditional Japanese ryokan with hot springs and elegant kaiseki meals.",
  "A pet-friendly resort where travelers can enjoy vacations with their four-legged friends.",
  "A retreat in the jungle, surrounded by greenery and pristine nature.",
  "A luxurious hotel with a 1920s style featuring captivating nostalgic spaces.",
  "A minimalist resort focused on relaxation, with quiet spaces and neutral color palettes.",
  "A music-themed hotel with rooms inspired by music legends.",
  "A paradise for food lovers with world-class meals and unique cooking experiences.",
  "A hotel center for businesspeople with modern workspaces and high-speed internet connections.",
  "A hotel inspired by the universe, offering a creative futuristic space.",
  "A resort specializing in healthcare with recovery therapies and meditation guidance.",
  "A hotel dedicated to gamers with high-tech gaming rooms and esports arenas.",
  "An underwater hotel offering a unique experience with beautiful views of the ocean world.",
  "A hotel inspired by Bollywood with movie-themed rooms and live performances.",
  "An ancient monastery converted into a serene hotel for travelers seeking peace.",
  "A hotel for book lovers, with a huge library and literature-themed rooms.",
  "A fashion-style boutique hotel, offering a classy and luxurious space.",
  "A hotel inspired by the magical world, suitable for those who love fairy tales.",
  "A nostalgic hotel with retro styles from the 60s, 70s, and 80s.",
];

const hotelNames = [
  "Luxe Haven Hotel",
  "Grand Imperial Hotel",
  "Serene Stay Inn",
  "Ocean Breeze Resort",
  "Skyline Suites",
  "Elite Retreat",
  "Harmony Hotel",
  "Golden Crest Hotel",
  "Urban Oasis Hotel",
  "Royal Garden Hotel",
  "Majestic Heights Hotel",
  "Tranquil Bay Resort",
  "Opulent Palace Hotel",
  "Silver Moon Inn",
  "Azure Waters Resort",
  "Sunset Serenity Hotel",
  "Paradise Cove Resort",
  "The Regal Manor",
  "Celestial Tower Hotel",
  "Elysium Grand Hotel",
  "Infinity View Hotel",
  "Prestige Plaza Hotel",
  "The Grand Monarch",
  "Horizon Bliss Resort",
  "Summit Peak Hotel",
  "Emerald Lagoon Hotel",
  "The Sapphire Retreat",
  "Radiance City Hotel",
  "Lavish Lagoon Resort",
  "Imperial Sun Hotel",
  "Diamond Coast Hotel",
  "Royal Orchid Resort",
  "Aqua Haven Hotel",
  "The Starlight Inn",
  "Whispering Pines Resort",
  "Timeless Elegance Hotel",
  "The Platinum Stay",
  "Crown Vista Hotel",
  "The Velvet Haven",
  "Zenith Skyline Hotel",
  "Pearl Essence Resort",
  "Majestic Riviera Hotel",
  "Blissful Horizon Inn",
  "Sunrise Splendor Hotel",
  "Grand Voyage Hotel",
  "Ethereal Charm Resort",
  "Golden Horizon Hotel",
  "Lush Retreat Hotel",
  "The Infinity Tower",
  "Opulence Suites",
  "Velvet Luxe Hotel",
  "Lighthouse Bay Resort",
];

const hotelAddresses = [
  "12 Nguyễn Huệ, Phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh",
  "45 Lê Lợi, Phường Bến Thành, Quận 3, Thành phố Hồ Chí Minh",
  "78 Hoàng Diệu, Phường 12, Quận 4, Thành phố Hồ Chí Minh",
  "23 Trần Hưng Đạo, Phường 6, Quận 5, Thành phố Hồ Chí Minh",
  "90 Phan Xích Long, Phường 3, Quận Phú Nhuận, Thành phố Hồ Chí Minh",
  "56 Võ Văn Kiệt, Phường Thạnh Mỹ Lợi, Thành phố Thủ Đức, Thành phố Hồ Chí Minh",
  "34 Tôn Đức Thắng, Phường Tân Phú, Quận 7, Thành phố Hồ Chí Minh",
  "67 Bùi Viện, Phường Phạm Ngũ Lão, Quận 6, Thành phố Hồ Chí Minh",
  "11 Đinh Tiên Hoàng, Phường 3, Quận Bình Thạnh, Thành phố Hồ Chí Minh",
  "102 Pasteur, Phường Bến Nghé, Quận 8, Thành phố Hồ Chí Minh",
  "45 Nguyễn Thị Minh Khai, Phường Bến Thành, Quận 10, Thành phố Hồ Chí Minh",
  "72 Nguyễn Văn Cừ, Phường An Khánh, Quận 11, Thành phố Hồ Chí Minh",
  "33 Lê Quang Định, Phường 7, Quận Bình Tân, Thành phố Hồ Chí Minh",
  "21 Mai Thị Lựu, Phường Đa Kao, Quận Bình Chánh, Thành phố Hồ Chí Minh",
  "101 Nguyễn Thái Học, Phường Tân Định, Quận Củ Chi, Thành phố Hồ Chí Minh",
  "8 Cao Thắng, Phường 12, Quận Gò Vấp, Thành phố Hồ Chí Minh",
  "59 Xô Viết Nghệ Tĩnh, Phường 21, Quận Cần Giờ, Thành phố Hồ Chí Minh",
  "12 Nguyễn Thị Minh Khai, Phường Đa Kao, Quận Tân Phú, Thành phố Hồ Chí Minh",
  "83 Ngô Quyền, Phường 12, Quận Tân Bình, Thành phố Hồ Chí Minh",
  "77 Lê Duẩn, Phường Phạm Ngũ Lão, Quận 1, Thành phố Hồ Chí Minh",
  "130 Nguyễn Hữu Cảnh, Phường 22, Quận Bình Thạnh, Thành phố Hồ Chí Minh",
  "99 Nguyễn Đình Chiểu, Phường 6, Quận 3, Thành phố Hồ Chí Minh",
  "39 Cộng Hòa, Phường 13, Quận Tân Bình, Thành phố Hồ Chí Minh",
  "50 Lê Hồng Phong, Phường 10, Quận 10, Thành phố Hồ Chí Minh",
  "15 Tràng Tiền, Phường Tràng Tiền, Quận Hoàn Kiếm, Thành phố Hà Nội",
  "28 Hàng Bông, Phường Hàng Bông, Quận Hoàn Kiếm, Thành phố Hà Nội",
  "55 Kim Mã, Phường Kim Mã, Quận Ba Đình, Thành phố Hà Nội",
  "77 Nguyễn Chí Thanh, Phường Láng Thượng, Quận Đống Đa, Thành phố Hà Nội",
  "31 Trần Duy Hưng, Phường Trung Hòa, Quận Cầu Giấy, Thành phố Hà Nội",
  "89 Lý Thường Kiệt, Phường Trần Hưng Đạo, Quận Hoàn Kiếm, Thành phố Hà Nội",
  "102 Lê Thanh Nghị, Phường Thanh Xuân, Quận Hai Bà Trưng, Thành phố Hà Nội",
  "40 Hàng Gai, Phường Hàng Bạc, Quận Hoàn Kiếm, Thành phố Hà Nội",
  "50 Trần Quốc Toản, Phường 4, Quận Hoàng Mai, Thành phố Hà Nội",
  "70 Trần Đăng Ninh, Phường Đại Mỗ, Quận Nam Từ Liêm, Thành phố Hà Nội",
  "25 Lê Duẩn, Phường Nguyễn Trung Trực, Quận Ba Đình, Thành phố Hà Nội",
  "56 Minh Khai, Phường Minh Khai, Quận Hai Bà Trưng, Thành phố Hà Nội",
  "72 Trường Chinh, Phường Khương Mai, Quận Thanh Xuân, Thành phố Hà Nội",
  "100 Nguyễn Chí Thanh, Phường Trung Liệt, Quận Đống Đa, Thành phố Hà Nội",
  "102 Võ Nguyên Giáp, Phường Phước Mỹ, Quận Hoàng Sa, Thành phố Đà Nẵng",
  "200 Bạch Đằng, Phường Phước Ninh, Quận Hải Châu, Thành phố Đà Nẵng",
  "17 Nguyễn Văn Linh, Phường Nam Dương, Quận Cẩm Lệ, Thành phố Đà Nẵng",
  "65 Phan Châu Trinh, Phường Phước Ninh, Quận Hải Châu, Thành phố Đà Nẵng",
  "25 Nguyễn Văn Linh, Phường An Hải Bắc, Quận Ngũ Hành Sơn, Thành phố Đà Nẵng",
  "57 Hùng Vương, Phường Bình Hiên, Quận Hải Châu, Thành phố Đà Nẵng",
  "80 Nguyễn Thị Minh Khai, Phường An Hải Đông, Quận Hoàng Sa, Thành phố Đà Nẵng",
  "38 Bùi Thị Xuân, Phường Phước Mỹ, Quận Sơn Trà, Thành phố Đà Nẵng",
  "12 Ngô Quyền, Phường An Hải Bắc, Quận Sơn Trà, Thành phố Đà Nẵng",
  "44 Lý Tự Trọng, Phường Hòa Cường Nam, Quận Hòa Vang, Thành phố Đà Nẵng",
  "71 Cách Mạng Tháng 8, Phường Thanh Bình, Quận Hòa Vang, Thành phố Đà Nẵng",
  "50 Nguyễn Công Trứ, Phường Phước Mỹ, Quận Sơn Trà, Thành phố Đà Nẵng",
  "39 Hải Phòng, Phường Thuận Phước, Quận Thanh Khê, Thành phố Đà Nẵng",
  "61 Trần Phú, Phường Thạch Thang, Quận Thanh Khê, Thành phố Đà Nẵng",
];

const roomTypes = [
  "Deluxe Room",
  "Superior Room",
  "Standard Room",
  "Family Suite",
  "Presidential Suite",
  "Executive Suite",
  "Budget Room",
  "Premium Room",
  "Classic Room",
  "Resort Room",
  "Ocean View Room",
  "Garden View Room",
  "Luxury Villa",
  "Penthouse Suite",
  "Honeymoon Suite",
  "Business Room",
  "Economy Room",
  "Studio Room",
  "Bungalow",
  "Loft Room",
  "Cottage Room",
  "Heritage Room",
  "Glasshouse Suite",
  "Skyline Room",
  "Eco-Friendly Room",
  "Mountain View Room",
  "Sunset Suite",
  "Poolside Room",
  "Japanese Tatami Room",
  "Rustic Cabin",
  "King Suite",
  "Queen Suite",
  "Presidential Bungalow",
  "Royal Deluxe",
  "Luxury Apartment",
  "Private Villa",
  "Seaside Bungalow",
  "Sky Lounge Suite",
  "Horizon View Room",
  "Infinity Pool Room",
  "Hillside Retreat",
  "Riverfront Room",
  "Grand Family Suite",
  "Safari Lodge",
  "Modern Loft",
  "Chalet Room",
  "Zen Retreat",
  "Coastal Haven",
  "Cityscape Room",
  "Heritage Grand Suite",
  "Tropical Paradise Room",
  "Penthouse Pool Suite",
  "Golf View Room",
  "Art Deco Room",
  "Bohemian Loft",
  "Minimalist Studio",
  "Mediterranean Escape",
  "Balinese Bungalow",
  "Winter Wonderland Room",
  "Rainforest Retreat",
  "Lakeside Cabin",
  "Sky Garden Suite",
  "Infinity Sky Pool Suite",
  "Presidential Lakehouse",
  "Executive Business Suite",
  "Boutique Chic Room",
  "Historic Mansion Room",
  "Private Island Villa",
  "Ski Chalet Suite",
  "Eco Jungle Retreat",
  "Sunset Ocean Room",
  "Desert Luxury Tent",
  "Urban Loft Suite",
  "Royal Palace Suite",
  "Cosy Attic Room",
  "Romantic Hideaway",
  "Lighthouse Suite",
  "Futuristic Capsule Room",
  "Victorian Manor Room",
  "Serene Bamboo Retreat",
  "Old Town Classic",
  "Mountain Hideout",
  "Hidden Gem Suite",
  "Adventure Bunker",
  "Cave Room",
  "Treetop Bungalow",
  "Floating Water Villa",
  "Ice Hotel Room",
  "Yacht Cabin",
  "Cultural Heritage Room",
  "Garden Studio",
  "Safari Tent",
  "Urban Chic Apartment",
  "Convertible Space Room",
  "Designer Concept Suite",
  "Film-Inspired Suite",
  "Pop Art Loft",
  "Space-Themed Capsule",
  "Underwater Suite",
  "Music-Inspired Room",
  "High-Tech Smart Room",
  "Exotic Jungle Villa",
  "Desert Dome Room",
  "Private Pool Villa",
  "Artisan Crafted Room",
  "Baroque Palace Room",
  "Futuristic Pod Room",
  "Scandinavian Minimalist Room",
  "Industrial Loft",
  "Cozy Cabin Retreat",
  "Fireplace Family Room",
  "Royal Victorian Suite",
  "Penthouse Sky Deck",
  "Spa & Wellness Suite",
  "Lakeview Penthouse",
  "Crystal Clear Bubble Room",
  "Nature Lodge",
  "Luxury Tent Suite",
  "Hilltop Grand Room",
  "Farmhouse Retreat",
  "Beachfront Sanctuary",
  "Gothic Castle Suite",
  "Bubble Dome Experience",
  "Himalayan Hideout",
  "Asian Fusion Loft",
  "Secluded Mountain Lodge",
  "Mysterious Themed Room",
  "Space Capsule Pod",
  "Art Studio Loft",
  "Luxury Train Suite",
  "Cultural Fusion Room",
  "Neo-Classical Suite",
  "Sci-Fi Concept Room",
  "Nordic Escape Room",
  "Castle Chamber Suite",
  "Safari King Suite",
  "Vintage Parisian Room",
  "Classic European Manor",
  "Highland Cottage",
  "Royal Garden Villa",
  "Tuscany Inspired Room",
  "Waterfall View Retreat",
  "Zodiac-Themed Room",
  "Exotic Tribal Suite",
  "Moroccan Palace Room",
  "Venetian Royal Chamber",
  "Floating River Suite",
  "Cottagecore Dream Room",
  "Elegant Fountain Suite",
  "Chic Urban Loft",
  "Themed Movie Room",
  "Smart Home Suite",
  "Automated Robot Room",
  "Marble Palace Suite",
  "Aqua Dome Room",
  "Art Nouveau Suite",
  "Beachside Luxury Tent",
  "Cuban Colonial Suite",
  "Classic Wooden Cabin",
  "City Rooftop Suite",
  "Designer Concept Pod",
  "Infinity Horizon Room",
  "Smart Minimalist Room",
  "Eco Timber Lodge",
  "High-Tech VR Room",
  "Custom Dream Suite",
  "Scenic Safari Lodge",
  "Futuristic Glass Pod",
  "Sky-High Observatory Suite",
  "Vintage Tea Room",
  "Opulent Gilded Suite",
  "Alpine Adventure Lodge",
  "Starlit Glamping Dome",
  "Modern Zen Retreat",
  "Renaissance Grand Suite",
  "Mystical Library Room",
  "Private Rock Cave Suite",
  "Grand Art Gallery Suite",
  "Retro 70s Chic Room",
  "Space-Age Futuristic Loft",
  "Glamorous Penthouse Retreat",
  "Historic Sultan Suite",
  "Neon Cyberpunk Loft",
  "Wild West Cowboy Room",
  "Egyptian Pharaoh Suite",
  "Underground Hidden Den",
  "Frozen Ice Palace Room",
  "Grand Chessboard Suite",
  "Hobbit Hole Retreat",
  "Enchanted Forest Room",
  "Fairytale Castle Room",
  "Luxury Casino Suite",
  "Musical Concert Room",
  "Jungle Canopy Suite",
  "Theater-Inspired Suite",
  "Digital Detox Cabin",
  "Gaming Paradise Room",
  "Floating Eco Lodge",
  "Asian Tranquility Suite",
  "Hollywood Star Room",
  "Caribbean Beach Suite",
];

const roomDescriptions = [
  "A spacious room with a stunning sea view.",
  "Room with a beautiful city view and luxurious interior.",
  "Well-equipped room with a comfortable double bed.",
  "Ideal for families with spacious and cozy atmosphere.",
  "Premium suite with exclusive services and luxurious space.",
  "Top-class experience with first-rate amenities.",
  "A budget-friendly option that still ensures comfort.",
  "Deluxe room with a private balcony.",
  "Classic space with luxurious wooden furniture.",
  "An ideal retreat with a nearby swimming pool.",
  "VIP room with panoramic night views of the city.",
  "Room furnished with premium leather furniture.",
  "Resort-style room with a spa-inspired bathroom.",
  "Special suite with a luxurious glass-walled bathroom.",
  "Japanese-style room with a traditional experience.",
  "Modern design with a king-size bed and spacious work desk.",
  "Green space with a private small garden.",
  "Peaceful experience with soundproof windows.",
  "Room with a private seating area.",
  "Villa-style room with direct access to the beach.",
];

const roomImage = [
  "https://i.pinimg.com/736x/6c/88/6a/6c886a58955b62b80b29d29a69432904.jpg",
  "https://i.pinimg.com/736x/4b/72/21/4b722154dc3f319b1f8e9ac7c0a48d4f.jpg",
  "https://i.pinimg.com/736x/d2/0d/f6/d20df6973cf3f59e840e898a1462b2da.jpg",
  "https://i.pinimg.com/736x/7f/eb/63/7feb63a3026ec37bfc7d1d8ffe3dc873.jpg",
  "https://i.pinimg.com/736x/7f/eb/63/7feb63a3026ec37bfc7d1d8ffe3dc873.jpg",
  "https://i.pinimg.com/736x/ba/07/4b/ba074bf20e916723432ce1bb3df949ec.jpg",
  "https://i.pinimg.com/736x/ba/07/4b/ba074bf20e916723432ce1bb3df949ec.jpg",
  "https://i.pinimg.com/736x/e2/a8/ba/e2a8baa8d5a171e4c80725801b648e81.jpg",
  "https://i.pinimg.com/736x/29/44/39/294439b399dd8f9905d7dc04c5c58ce2.jpg",
  "https://i.pinimg.com/736x/11/49/fb/1149fb05369b91e4cb07fc85cc67426e.jpg",
  "https://i.pinimg.com/736x/1a/13/f9/1a13f9cc5a076c71449e2ffd7dcbfd94.jpg",
  "https://i.pinimg.com/736x/0b/ec/aa/0becaa9013e485340fc15704e8ea7bd5.jpg",
  "https://i.pinimg.com/736x/f7/ca/52/f7ca520754b7b1762a046fc32380beda.jpg",
  "https://i.pinimg.com/736x/53/f1/3d/53f13d79d88322ae511b5f2ed6aa90aa.jpg",
  "https://i.pinimg.com/736x/91/75/72/9175726f32ba9ef74fb7eab078d4c8c9.jpg",
  "https://i.pinimg.com/736x/44/2c/f0/442cf046ba3a72c97a3a406328a8604f.jpg",
  "https://i.pinimg.com/736x/82/85/41/82854152d968f7ecd7ab6a8134b9c801.jpg",
  "https://i.pinimg.com/736x/e2/b6/44/e2b644225297edc672c37475c2e71bd1.jpg",
  "https://i.pinimg.com/736x/89/7a/32/897a32e588f88300cc58fc696ed16e70.jpg",
  "https://i.pinimg.com/736x/e1/2b/1e/e12b1eef92fcbb8d148366a02a29d62b.jpg",
  "https://i.pinimg.com/736x/e9/40/4b/e9404b59bd7c3ec545b82be0def660f2.jpg",
  "https://i.pinimg.com/736x/34/fb/8e/34fb8e98222d0c6c1e617560c574b2b7.jpg",
  "https://i.pinimg.com/736x/58/52/f9/5852f9c6d22bbf48966279db9bd83be2.jpg",
  "https://i.pinimg.com/736x/d6/87/32/d687326d8acb084b6767ebfcef6b04d2.jpg",
  "https://i.pinimg.com/736x/56/d8/45/56d8450d55513d4e3b93877c708a47b4.jpg",
  "https://i.pinimg.com/736x/3e/32/ed/3e32ed6be00cdfdbe696736b93d14a74.jpg",
  "https://i.pinimg.com/736x/4e/d3/5c/4ed35c9263929654b9076cf8968047ae.jpg",
  "https://i.pinimg.com/736x/9a/76/1b/9a761b45824d60a117dc7a484cc5c93b.jpg",
  "https://i.pinimg.com/736x/72/94/b9/7294b9f07d5c8374552504a82ecc53cb.jpg",
  "https://i.pinimg.com/736x/4d/ee/19/4dee19b6b2af0c305f6e9b013fe18fdc.jpg",
  "https://i.pinimg.com/736x/85/9c/22/859c2298f64ef85e3b28d10b03f402bb.jpg",
  "https://i.pinimg.com/736x/4e/e1/d2/4ee1d24d87d37c5ddcab157af20d902e.jpg",
];

const hotelImage = [
  "https://i.pinimg.com/736x/8a/eb/20/8aeb20492a1c5dd51909352ea4f3c570.jpg",
  "https://i.pinimg.com/736x/c0/74/a3/c074a3d76474c26eb9694631edd6c59e.jpg",
  "https://i.pinimg.com/736x/10/1b/ae/101bae2e28dc30ea889ba93d6c058886.jpg",
  "https://i.pinimg.com/736x/3f/68/a8/3f68a890de2144e224e46fb21c756a41.jpg",
  "https://i.pinimg.com/736x/ab/5d/d4/ab5dd428955149bc39f3e92edbf01eb1.jpg",
  "https://i.pinimg.com/736x/22/7b/3b/227b3b3096fa77288e15617b4947af8b.jpg",
  "https://i.pinimg.com/736x/1e/82/db/1e82db2dfcee66dbd3dab40359a0533a.jpg",
  "https://i.pinimg.com/736x/96/4d/1d/964d1dc9693e6286c48a3f5cfd1cbbb0.jpg",
  "https://i.pinimg.com/736x/0a/4d/c3/0a4dc359a857b9c98fc7e0d99b8a80d5.jpg",
  "https://i.pinimg.com/736x/17/1e/af/171eaf32f503df8a085367a8bf155da9.jpg",
  "https://i.pinimg.com/736x/36/84/90/368490a019e5376e3fc21c0c5f2f5e92.jpg",
  "https://i.pinimg.com/736x/03/40/8b/03408b1ce609497438bb60a07a764398.jpg",
  "https://i.pinimg.com/736x/3f/64/c6/3f64c6d642c7128f11ee6ac26138407a.jpg",
  "https://i.pinimg.com/736x/89/c0/92/89c09207356de3fe14b7d5692c4a3411.jpg",
  "https://i.pinimg.com/736x/89/c0/92/89c09207356de3fe14b7d5692c4a3411.jpg",
  "https://i.pinimg.com/736x/5b/b5/08/5bb508fc74fd9864107216cf1e9ef450.jpg",
  "https://i.pinimg.com/736x/77/d1/74/77d17473cf4f1c3eb5aec7e381930025.jpg",
  "https://i.pinimg.com/736x/88/29/b1/8829b159416c99734c1b742be4ad9f09.jpg",
  "https://i.pinimg.com/736x/02/27/3f/02273f2568b055775825730c29f5001b.jpg",
  "https://i.pinimg.com/736x/da/fc/fa/dafcfa156af0f8c61036f9131c83fe20.jpg",
  "https://i.pinimg.com/736x/1a/b2/c7/1ab2c74722fc1a74d874af4071bede51.jpg",
  "https://i.pinimg.com/736x/4f/bd/68/4fbd684337df5152f4d6e33e4ff52b38.jpg",
  "https://i.pinimg.com/736x/6f/d1/2d/6fd12d8f7559c7a21c52aa782d22287f.jpg",
  "https://i.pinimg.com/736x/86/4d/4b/864d4beed3779d530b4388052d9b2cb6.jpg",
  "https://i.pinimg.com/736x/2b/46/fc/2b46fc944691029b2f49c5fa2eef893e.jpg",
  "https://i.pinimg.com/736x/42/04/c8/4204c8c328a8d86280dda711c545f9cf.jpg",
  "https://i.pinimg.com/736x/6a/aa/cd/6aaacd9a8009044b595ffcaa5aca7681.jpg",
  "https://i.pinimg.com/736x/2d/f6/11/2df6114307d9b93b925026b275b392a3.jpg",
  "https://i.pinimg.com/736x/cd/4e/a1/cd4ea1470db39a3c43021ab7d8a96db8.jpg",
  "https://i.pinimg.com/736x/6e/8a/c9/6e8ac97a5c24098c4844153b744fa2a4.jpg",
  "https://i.pinimg.com/736x/6e/8a/c9/6e8ac97a5c24098c4844153b744fa2a4.jpg",
  "https://i.pinimg.com/736x/fa/02/06/fa0206cb4a813d05f5b56dc1c4681a8b.jpg",
  "https://i.pinimg.com/736x/0e/97/13/0e971336348fabb5a30df2ca76b512dd.jpg",
  "https://i.pinimg.com/736x/ad/54/bf/ad54bf18bebd9d71103b68cee09fe6fb.jpg",
  "https://i.pinimg.com/736x/f3/3f/eb/f33feb864f7f72b753b48c8a9003d405.jpg",
  "https://i.pinimg.com/736x/1c/31/7c/1c317c4053b0835a3a54944ace8b66f0.jpg",
  "https://i.pinimg.com/736x/8a/eb/20/8aeb20492a1c5dd51909352ea4f3c570.jpg",
  "https://i.pinimg.com/736x/c0/74/a3/c074a3d76474c26eb9694631edd6c59e.jpg",
  "https://i.pinimg.com/736x/10/1b/ae/101bae2e28dc30ea889ba93d6c058886.jpg",
  "https://i.pinimg.com/736x/3f/68/a8/3f68a890de2144e224e46fb21c756a41.jpg",
  "https://i.pinimg.com/736x/ab/5d/d4/ab5dd428955149bc39f3e92edbf01eb1.jpg",
  "https://i.pinimg.com/736x/22/7b/3b/227b3b3096fa77288e15617b4947af8b.jpg",
  "https://i.pinimg.com/736x/1e/82/db/1e82db2dfcee66dbd3dab40359a0533a.jpg",
  "https://i.pinimg.com/736x/96/4d/1d/964d1dc9693e6286c48a3f5cfd1cbbb0.jpg",
  "https://i.pinimg.com/736x/0a/4d/c3/0a4dc359a857b9c98fc7e0d99b8a80d5.jpg",
  "https://i.pinimg.com/736x/17/1e/af/171eaf32f503df8a085367a8bf155da9.jpg",
  "https://i.pinimg.com/736x/36/84/90/368490a019e5376e3fc21c0c5f2f5e92.jpg",
  "https://i.pinimg.com/736x/03/40/8b/03408b1ce609497438bb60a07a764398.jpg",
  "https://i.pinimg.com/736x/3f/64/c6/3f64c6d642c7128f11ee6ac26138407a.jpg",
  "https://i.pinimg.com/736x/89/c0/92/89c09207356de3fe14b7d5692c4a3411.jpg",
  "https://i.pinimg.com/736x/89/c0/92/89c09207356de3fe14b7d5692c4a3411.jpg",
  "https://i.pinimg.com/736x/5b/b5/08/5bb508fc74fd9864107216cf1e9ef450.jpg",
  "https://i.pinimg.com/736x/77/d1/74/77d17473cf4f1c3eb5aec7e381930025.jpg",
  "https://i.pinimg.com/736x/88/29/b1/8829b159416c99734c1b742be4ad9f09.jpg",
  "https://i.pinimg.com/736x/02/27/3f/02273f2568b055775825730c29f5001b.jpg",
  "https://i.pinimg.com/736x/da/fc/fa/dafcfa156af0f8c61036f9131c83fe20.jpg",
  "https://i.pinimg.com/736x/1a/b2/c7/1ab2c74722fc1a74d874af4071bede51.jpg",
  "https://i.pinimg.com/736x/4f/bd/68/4fbd684337df5152f4d6e33e4ff52b38.jpg",
  "https://i.pinimg.com/736x/6f/d1/2d/6fd12d8f7559c7a21c52aa782d22287f.jpg",
  "https://i.pinimg.com/736x/86/4d/4b/864d4beed3779d530b4388052d9b2cb6.jpg",
  "https://i.pinimg.com/736x/2b/46/fc/2b46fc944691029b2f49c5fa2eef893e.jpg",
  "https://i.pinimg.com/736x/42/04/c8/4204c8c328a8d86280dda711c545f9cf.jpg",
  "https://i.pinimg.com/736x/6a/aa/cd/6aaacd9a8009044b595ffcaa5aca7681.jpg",
  "https://i.pinimg.com/736x/2d/f6/11/2df6114307d9b93b925026b275b392a3.jpg",
  "https://i.pinimg.com/736x/cd/4e/a1/cd4ea1470db39a3c43021ab7d8a96db8.jpg",
  "https://i.pinimg.com/736x/6e/8a/c9/6e8ac97a5c24098c4844153b744fa2a4.jpg",
  "https://i.pinimg.com/736x/6e/8a/c9/6e8ac97a5c24098c4844153b744fa2a4.jpg",
  "https://i.pinimg.com/736x/fa/02/06/fa0206cb4a813d05f5b56dc1c4681a8b.jpg",
  "https://i.pinimg.com/736x/0e/97/13/0e971336348fabb5a30df2ca76b512dd.jpg",
  "https://i.pinimg.com/736x/ad/54/bf/ad54bf18bebd9d71103b68cee09fe6fb.jpg",
  "https://i.pinimg.com/736x/f3/3f/eb/f33feb864f7f72b753b48c8a9003d405.jpg",
  "https://i.pinimg.com/736x/1c/31/7c/1c317c4053b0835a3a54944ace8b66f0.jpg",
];

const servicesName = [
  "In-room Breakfast",
  "International Breakfast Buffet",
  "Evening Seafood Buffet",
  "Traditional Vietnamese Spa",
  "SkyView Fitness Center",
  "City Explorer Motorbike Rental",
  "Healthy Morning Set",
  "Continental Breakfast Selection",
  "BBQ Dinner by the Pool",
  "Luxury Aromatherapy Spa",
  "24/7 Fitness Hub",
  "Daily City Tour Bike Rental",
  "Local Flavor Breakfast",
  "Pan-Asian Breakfast Buffet",
  "Chef’s Special Dinner Buffet",
  "Hot Stone Spa Therapy",
  "Indoor Strength Gym",
  "Coastal Ride Motorbike Rental",
  "Organic Breakfast Experience",
  "Eco-Farm Breakfast Buffet",
  "Cultural Cuisine Dinner Buffet",
  "Deep Tissue Massage & Spa",
  "Fitness Lounge with Sauna",
  "Adventure Scooter Rentals",
  "Floating Breakfast Service",
  "Fusion Breakfast Buffet",
  "Romantic Candlelight Dinner",
  "Tropical Herbal Spa",
  "Mountain View Fitness Zone",
  "Weekend Motorbike Tours",
  "Gluten-free Morning Set",
  "French-Inspired Breakfast Bar",
  "Live Grill Night Buffet",
  "Ocean Therapy Spa",
  "High-End Tech Gym",
  "Countryside Bike Rental",
  "Kid-friendly Breakfast Service",
  "Multi-cuisine Morning Feast",
  "Asian-European Buffet Night",
  "Luxury Couple Spa Suite",
  "Sunrise Fitness Studio",
  "Hourly Motorbike Hire"
];

const serviceDescriptions = [
  "Enjoy a personalized breakfast served directly to your room at your preferred time.",
  "Start your morning with a range of international cuisines and fresh fruit stations.",
  "Indulge in freshly grilled seafood under the stars, right by the beachfront.",
  "Relax in a calming spa with traditional herbal treatments and local ingredients.",
  "Work out while overlooking the city skyline in our panoramic rooftop gym.",
  "Discover the city with our easy-to-rent scooters, including helmets and maps.",
  "Fresh fruits, oats, and detox juices for a health-conscious start to your day.",
  "Bread, cheese, eggs, and more – all you need for a classic European-style breakfast.",
  "Join our open-air BBQ every evening, featuring live music and grilled delights.",
  "Soak in calming scents and let our masseuses pamper you with essential oils.",
  "Stay active anytime with our fully equipped 24/7 indoor training facility.",
  "Roam the nearby landmarks with a rental bike and a complimentary city guide.",
  "Wake up to a traditional Vietnamese breakfast with pho and bánh mì.",
  "A wide selection of Asian and Western breakfast dishes to suit all tastes.",
  "Dine on rotating themes, from Italian nights to Vietnamese comfort food.",
  "Our signature therapy includes hot stones and acupressure techniques.",
  "Our gym offers bodyweight zones, resistance machines, and yoga mats.",
  "Perfect for scenic drives along the coast or exploring nearby rural towns.",
  "Locally sourced and organic ingredients define this nourishing breakfast.",
  "Enjoy breakfast made with produce straight from our eco-friendly farm.",
  "Savor regional dishes prepared to showcase Vietnamese heritage.",
  "Recharge with a firm massage focused on relieving deep muscle tension.",
  "Includes weights, cardio machines, sauna, and relaxation area.",
  "Take scenic scooter trips with GPS-equipped bikes and fuel included.",
  "Floating trays served in your private pool with fruits and pastries.",
  "Modern fusion dishes blending Asian spices and Western classics.",
  "A perfect dinner setting with live violin music and wine pairings.",
  "Relieve stress with tropical fruit-based scrubs and warm compresses.",
  "Train with a view of the surrounding mountains and fresh air.",
  "Curated motorbike tours on weekends with local guides.",
  "Ideal for dietary needs: gluten-free, dairy-free, and allergen-free.",
  "Inspired by Parisian cafés, enjoy croissants and espresso daily.",
  "Our live station buffet brings sizzling flavors right to your table.",
  "Natural sea salt scrubs and water therapies for total relaxation.",
  "High-tech machines, fitness tracking, and smart mirrors included.",
  "Cycle through nature trails and quiet villages with ease.",
  "With pancakes, cereals, and fun snacks, your kids will love breakfast.",
  "Includes everything from dim sum to eggs benedict in one buffet.",
  "Taste culinary fusions with rotating dishes each night of the week.",
  "Designed for couples, this spa suite offers privacy and pampering.",
  "Morning classes and equipment with beach sunrise views.",
  "Need just a few hours? Our flexible motorbike rental plans got you."
];


//Bỏ Facility dùng HotelFacility - bỏ trường HotelID
//Bỏ RoomID trong roomFacility

// Reset database

//Tự tạo USER nếu chạy local
const userIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const hotelIds = [];
const serviceIds = [];
const roomIds = [];
const reservationIds = [];
const hotelfacilityIds = [];
const roomFacilityIds = [];

// Danh sách loại giường cố định
const bedTypes = [
  {
    name: "Single Bed",
    description: "A single bed suitable for one person. Width: 90 - 130 cm.",
    bedWidth: "Width 90 - 130 cm",
  },
  {
    name: "Double Bed", 
    description: "A double bed ideal for two people. Width: 131 - 150 cm.",
    bedWidth: "Width 131 - 150 cm",
  },
  {
    name: "King Bed",
    description: "A king-size bed for extra comfort, suitable for two or more people. Width: 151 - 180 cm.",
    bedWidth: "Width 151 - 180 cm",
  },
  {
    name: "Super King Beds",
    description: "Room with two large single beds, suitable for two people. Total width: 181 - 210 cm.",
    bedWidth: "Width 181 - 210 cm",
  },
];


// Insert Beds
const bedDocs = db.beds.insertMany(bedTypes);
const bedIds = Object.values(bedDocs.insertedIds);

// Danh sách facility có sẵn
const facilitiesName = [
  {
    name: "Free Wi-Fi",
    icon: "FaWifi",
    description: "Free high-speed internet for guests.",
  },
  {
    name: "Swimming Pool",
    icon: "FaSwimmingPool",
    description: "Spacious, clean, and modern swimming pool.",
  },
  {
    name: "Parking Lot",
    icon: "FaParking",
    description: "Free parking available for staying guests.",
  },
  {
    name: "24/7 Room Service",
    icon: "FaConciergeBell",
    description: "Room service available at all times.",
  },
  {
    name: "Restaurant",
    icon: "FaUtensils",
    description: "Restaurant serving a wide variety of delicious dishes.",
  },
  {
    name: "Fitness Center",
    icon: "FaDumbbell",
    description: "Gym fully equipped with modern facilities.",
  },
  {
    name: "Airport Shuttle",
    icon: "FaShuttleVan",
    description: "Convenient airport transfer service for guests.",
  },
  {
    name: "Spa & Wellness Center",
    icon: "FaSpa",
    description: "Relaxing spa treatments and wellness options.",
  },
  {
    name: "Laundry Service",
    icon: "FaHandsWash",
    description: "Professional laundry and dry-cleaning service.",
  },
  {
    name: "Conference Room",
    icon: "FaChalkboardTeacher",
    description: "Spacious and well-equipped conference facilities.",
  },
  {
    name: "Pet-Friendly",
    icon: "FaDog",
    description: "Pets are welcome in designated rooms.",
  },
  {
    name: "Mini Bar",
    icon: "FaWineBottle",
    description: "In-room mini bar with snacks and beverages.",
  },
];

const roomFacilities = [
  {
    name: "Air Conditioning",
    description: "Provides cool and comfortable air on hot days.",
    icon: "FaSnowflake",
  },
  {
    name: "Flat-screen TV",
    description: "Enjoy your favorite shows on a high-definition screen.",
    icon: "FaTv",
  },
  {
    name: "Mini Bar",
    description: "Snacks and beverages are available.",
    icon: "FaWineBottle",
  },
  {
    name: "Private Bathroom",
    description: "Includes shower, bathtub, and free toiletries.",
    icon: "FaBath",
  },
  {
    name: "Coffee Maker",
    description: "Brew fresh coffee right in your room.",
    icon: "FaCoffee",
  },
  {
    name: "High-speed Wi-Fi",
    description: "Fast and stable internet connection.",
    icon: "FaWifi",
  },
  {
    name: "In-room Safe",
    description: "Safely store valuables and important documents.",
    icon: "FaLock",
  },
  {
    name: "Work Desk",
    description: "Convenient workspace for business travelers.",
    icon: "FaLaptop",
  },
  {
    name: "Soundproofing",
    description: "Ensures a quiet and relaxing stay.",
    icon: "FaVolumeMute",
  },
  {
    name: "Balcony",
    description: "Enjoy a private outdoor space with a beautiful view.",
    icon: "FaHome",
  },
];

//Tránh giá trị trùng lặp và tạo đủ với dữ liệu
let insertedRoomFacilities = new Set();

//Insert Room Facility
for (let i = 0; i < roomFacilities.length; i++) {
  if (!insertedRoomFacilities.has(roomFacilities[i].name)) {
    let roomFacility = db.roomfacilities.insertOne({
      name: roomFacilities[i].name,
      description: roomFacilities[i].description,
      icon: roomFacilities[i].icon,
    });

    roomFacilityIds.push(roomFacility.insertedId);
    insertedRoomFacilities.add(roomFacilities[i].name);
  }
}

//Insert facility
let insertedFacilities = new Set();

for (let i = 0; i < facilitiesName.length; i++) {
  let facilityName = facilitiesName[i].name; // Kiểm tra nếu chưa tồn tại mới insert

  if (!insertedFacilities.has(facilitiesName[i].name)) {
    let facility = db.hotelfacilities.insertOne({
      name: facilityName,
      description: facilitiesName[i].description,
      icon: facilitiesName[i].icon,
    });

    hotelfacilityIds.push(facility.insertedId);
    insertedFacilities.add(facilitiesName[i].name);
  }
}

// Insert hotel service
for (let i = 0; i < 42; i++) {
  let randomPrice = Math.floor(Math.random() * (100 - 10 + 1)) + 10;
  let existingService = db.hotelservices.findOne({ name: servicesName[i] });

  if (!existingService) {
    let hotelService = db.hotelservices.insertOne({
      name: servicesName[i],
      description: serviceDescriptions[i], // Match index correctly
      type: servicesName[i].includes("Buffet") ? "person" : "service",
      price: randomPrice,
      statusActive: "ACTIVE",
    });
    serviceIds.push(hotelService.insertedId);
  }
}

//Insert hotel
for (let i = 0; i < 60; i++) {
  let randomIndex = i % hotelNames.length;

  let hotelFacilityIds = hotelfacilityIds
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(Math.random() * 3) + 3);

  let hotelServiceIds = [serviceIds]
  .sort(() => 0.5 - Math.random())
  .slice(0, Math.floor(Math.random() * 3) + 3);

  let images = [];
  let numImages = 5;
  for (let k = 0; k < numImages; k++) {
    let hotelImageUrl =
      hotelImage[Math.floor(Math.random() * hotelImage.length)];
    images.push(hotelImageUrl);
  } // **🛑 Kiểm tra khách sạn có bị trùng không trước khi insert**

  let existingHotel = db.hotels.findOne({
    hotelName: hotelNames[i],
    address: hotelAddresses[i],
  });

  if (!existingHotel) {
    let hotel = db.hotels.insertOne({
      hotelName: hotelNames[i],
      owner: i >= 11 ? 0 : i + 1,
      description: hotelDescriptions[randomIndex],
      address: hotelAddresses[i],
      adminStatus: "APPROVED",
      ownerStatus: "ACTIVE",
      services: i <= 14 ? serviceIds.slice(i * 3, i * 3 + 3) : [],
      facilities: hotelFacilityIds,
      star: Math.floor(Math.random() * 5) + 1, // 2-5 sao
      rating: Math.floor(Math.random() * 5) + 1, // 1-5 rating
      pricePerNight:
      Math.floor(Math.random() * ((2000 - 500) / 10 + 1)) * 10 + 500,
      images: images,
      checkInStart: "12:00",
      checkInEnd: "13:00",
      checkOutStart: "10:00",
      checkOutEnd: "11:00",
      ownerStatus: "ACTIVE",
    });

    hotelIds.push(hotel.insertedId);
  }
}

for (let i = 0; i < 50; i++) {
  for (let j = 0; j < 3; j++) {
    let selectedBeds = Array.from({ length: 1 }, () => ({
      bed: bedIds[Math.floor(Math.random() * bedIds.length)],
      quantity: Math.floor(Math.random() * 3) + 1,
    }));

    let images = [];
    let numImages = 5; // Chọn ngẫu nhiên từ 1-3 hình ảnh cho mỗi phòng
    for (let k = 0; k < numImages; k++) {
      let randomImage = roomImage[Math.floor(Math.random() * roomImage.length)];
      images.push(randomImage);
    }

    let shuffledFacilities = roomFacilityIds
      .map((facility) => ({ facility, sort: Math.random() })) // Thêm giá trị ngẫu nhiên
      .sort((a, b) => a.sort - b.sort) // Sắp xếp theo giá trị ngẫu nhiên
      .slice(0, Math.floor(Math.random() * 3) + 3) // Chọn từ 3-5 phần tử
      .map(({ facility }) => facility); // Lấy lại giá trị gốc

    let room = db.rooms.insertOne({
      name: roomNames[Math.floor(Math.random() * roomNames.length)],
      type: roomTypes[Math.floor(Math.random() * roomTypes.length)],
      price: Math.floor(Math.random() * ((1000 - 100) / 10 + 1)) * 10 + 100,
      capacity: Math.floor(Math.random() * 4) + 1,
      description:
      roomDescriptions[Math.floor(Math.random() * roomDescriptions.length)],
      images: images,
      facilities: shuffledFacilities,
      quantity: Math.floor(Math.random() * 5) + 3,
      hotel: hotelIds[i % hotelIds.length],
      bed: selectedBeds,
      statusActive: "ACTIVE",
    });
    roomIds.push(room.insertedId);
  }
}

// Insert 100 hotels (Mỗi khách sạn có 5 ảnh và 3-5 facility)
for (let i = 0; i < hotelNames.length; i++) {
  let randomIndex = i % hotelNames.length;

  let hotelFacilityIds = hotelfacilityIds
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(Math.random() * 3) + 3);

  let hotelServiceIds = serviceIds
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(Math.random() * 3) + 3);

  let images = [];
  let numImages = 5; // 4-11 hình ảnh mỗi khách sạn
  for (let k = 0; k < numImages; k++) {
    let hotelImageUrl =
      hotelImage[Math.floor(Math.random() * hotelImage.length)];
    images.push(hotelImageUrl);
  } // **🛑 Kiểm tra khách sạn có bị trùng không trước khi insert**

  let existingHotel = db.hotels.findOne({
    hotelName: hotelNames[i],
    address: hotelAddresses[i],
  });

  if (!existingHotel) {
    let hotel = db.hotels.insertOne({
      hotelName: hotelNames[i],
      owner: i >= 11 ? 0 : i + 1,
      description: hotelDescriptions[randomIndex],
      address: hotelAddresses[i],
      adminStatus: "APPROVED",
      ownerStatus: "ACTIVE",
      services: i <= 14 ? serviceIds.slice(i * 3, i * 3 + 3) : [],
      facilities: hotelFacilityIds,
      star: Math.floor(Math.random() * 5) + 1, // 2-5 sao
      rating: Math.floor(Math.random() * 5) + 1, // 1-5 rating
      pricePerNight:
      Math.floor(Math.random() * ((2000 - 500) / 10 + 1)) * 10 + 500, // 5000 - 2000
      images: images,
      checkInStart: "12:00",
      checkInEnd: "13:00",
      checkOutStart: "10:00",
      checkOutEnd: "11:00",
      ownerStatus: "ACTIVE",
    });

    hotelIds.push(hotel.insertedId);
  }
}

// Insert 60 rooms (Mỗi phòng có 3 ảnh)
for (let i = 0; i < 20; i++) {
  for (let j = 0; j < 3; j++) {
    let selectedBeds = Array.from({ length: 1 }, () => ({
      bed: bedIds[Math.floor(Math.random() * bedIds.length)],
      quantity: Math.floor(Math.random() * 3) + 1,
    }));

    let images = [];
    let numImages = 5; // Chọn ngẫu nhiên từ 1-3 hình ảnh cho mỗi phòng
    for (let k = 0; k < numImages; k++) {
      let randomImage = roomImage[Math.floor(Math.random() * roomImage.length)];
      images.push(randomImage);
    }

    let shuffledFacilities = roomFacilityIds
      .map((facility) => ({ facility, sort: Math.random() })) // Thêm giá trị ngẫu nhiên
      .sort((a, b) => a.sort - b.sort) // Sắp xếp theo giá trị ngẫu nhiên
      .slice(0, Math.floor(Math.random() * 3) + 3) // Chọn từ 3-5 phần tử
      .map(({ facility }) => facility); // Lấy lại giá trị gốc

    let room = db.rooms.insertOne({
      name: roomNames[Math.floor(Math.random() * roomNames.length)],
      type: roomTypes[Math.floor(Math.random() * roomTypes.length)],
      price: Math.floor(Math.random() * ((1000 - 100) / 10 + 1)) * 10 + 100,
      capacity: Math.floor(Math.random() * 4) + 1,
      description:
        roomDescriptions[Math.floor(Math.random() * roomDescriptions.length)],
      images: images,
      quantity: Math.floor(Math.random() * 10) + 1,
      hotel: hotelIds[i % hotelIds.length],
      facilities: shuffledFacilities,
      bed: selectedBeds,
      statusActive: "ACTIVE",
    });
    roomIds.push(room.insertedId);
  }
}

const now = new Date();
// Trạng thái của Reservation
const reservationStatuses = [
  "CHECKED OUT", // Đã check-out, có thể để lại phản hồi
  "COMPLETED", // Hoàn thành, đã phản hồi
  "BOOKED", // Đã đặt, trả tiền nhưng chưa check-in
  "CHECKED IN", // Đang ở, đã check-in
  "PENDING", // Chờ xử lý hoặc xác nhận
  "CANCELLED", // Đã hủy
  // "NOT PAID", // Chưa trả tiền
];

for (let i = 0; i < 1000; i++) {
  let randomStatus =
    reservationStatuses[Math.floor(Math.random() * reservationStatuses.length)];

  let selectedRoomIds = [];
  while (selectedRoomIds.length < 3) {
    let randomRoom = roomIds[Math.floor(Math.random() * roomIds.length)];
    if (!selectedRoomIds.includes(randomRoom)) {
      selectedRoomIds.push(randomRoom);
    }
  }

  let selectedRooms = selectedRoomIds.map((roomId) => ({
    room: roomId,
    quantity: Math.floor(Math.random() * 3) + 1,
  }));

  let checkInDate, checkOutDate;

  // Tạo ngày createdAt ngẫu nhiên trong quá khứ
  let createdAt = new Date(now);
  createdAt.setDate(now.getDate() - Math.floor(Math.random() * 100 + 40));

  switch (randomStatus) {
    case "BOOKED":
    case "PENDING":
    case "CANCELLED":
    case "NOT PAID":
      checkInDate = new Date(now);
      checkInDate.setDate(now.getDate() + Math.floor(Math.random() * 60 + 1));
      checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(
        checkInDate.getDate() + Math.floor(Math.random() * 5 + 1)
      );
      break;

    case "CHECKED IN":
      checkInDate = new Date(now);
      checkInDate.setDate(now.getDate() - Math.floor(Math.random() * 3 + 2));
      checkOutDate = new Date(now);
      checkOutDate.setDate(
        checkInDate.getDate() + Math.floor(Math.random() * 3 + 2)
      );
      if (checkInDate >= now) checkInDate.setDate(now.getDate() - 1); // đảm bảo check-in < hiện tại
      if (checkOutDate < now) checkOutDate.setDate(now.getDate() + 1); // đảm bảo check-out > hiện tại
      break;

    case "CHECKED OUT":
    case "COMPLETED":
      checkInDate = new Date(createdAt);
      checkInDate.setDate(
        createdAt.getDate() + Math.floor(Math.random() * 30 + 1)
      );
      checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(
        checkInDate.getDate() + Math.floor(Math.random() * 7 + 1)
      );
      if (checkOutDate <= now) checkOutDate.setDate(now.getDate() + 10); // đảm bảo checkOut > hiện tại
      if (checkInDate <= now) checkInDate.setDate(now.getDate() + 5); // đảm bảo checkIn > hiện tại
      break;
  }

  let numNights = Math.ceil(
    (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
  );
  let totalPrice = 0;

  let hotelId = hotelIds[i % hotelIds.length];
  let hotelData = db.hotels.findOne({ _id: hotelId });
  let hotelPricePerNight = hotelData ? hotelData.pricePerNight || 0 : 0;

  for (let k = 0; k < selectedRooms.length; k++) {
    let roomData = db.rooms.findOne({ _id: selectedRooms[k].room });
    let roomPrice = roomData ? roomData.price : 0;
    totalPrice += roomPrice * selectedRooms[k].quantity * numNights;
  }

  totalPrice += hotelPricePerNight * numNights;

  if (isNaN(totalPrice)) {
    console.error(`❌ Lỗi: totalPrice = NaN tại lượt thứ ${i + 1}`);
    console.error({
      checkInDate,
      checkOutDate,
      numNights,
      selectedRooms,
      hotelPricePerNight,
      totalPrice,
    });
    continue;
  }

  const randomUserId = Math.floor(Math.random() * 5) + 11;

  let reservation = db.reservations.insertOne({
    user: randomUserId,
    hotel: hotelId,
    rooms: selectedRooms,
    checkInDate,
    checkOutDate,
    status: randomStatus,
    totalPrice,
    createdAt,
  });

  reservationIds.push(reservation.insertedId);
}

function getRandomDateWithinDays(days) {
  const now = new Date();
  const past = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return new Date(
    past.getTime() + Math.random() * (now.getTime() - past.getTime())
  );
}

// Insert 10 Feedbacks - chỉ áp dụng với reservation có trạng thái hợp lệ
reservationIds.forEach((resId) => {
  let reservation = db.reservations.findOne({ _id: resId });
  if (reservation && reservation.status === "COMPLETED") {
    db.feedbacks.insertOne({
      user: reservation.user, // Lấy thông tin user từ reservation
      reservation: resId,
      hotel: reservation.hotel, // Lấy thông tin khách sạn từ reservation
      content:
        feedbackContents[Math.floor(Math.random() * feedbackContents.length)],
      likedBy: [3, 4, 5, 6, 11, 12, 13, 14],
      dislikedBy: [1, 2, 7, 8, 9, 10, 15],
      rating: Math.floor(Math.random() * 5) + 1,
      createdAt: getRandomDateWithinDays(30), // Random trong 30 ngày gần nhất
    });
  }
});

const hotelId = hotelIds.map((id) => ObjectId(id));

db.users.updateOne(
  { _id: 11 }, // thay 1 bằng id thực tế
  {
    $addToSet: {
      favorites: { $each: hotelId },
    },
  }
);