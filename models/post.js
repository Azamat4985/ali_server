import mongoose from "mongoose";
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    email: {
      type: String,
    },
    name: {
      type: String,
    },
    type: {
      type: String,
    },
    isOur: {
      type: String,
    },
    description: {
      type: String,
    },
    region: {
      type: String,
    },
    city: {
      type: String,
    },
    district: {
      type: String,
    },
    mainPhoto_path: {
      type: String,
    },
    photos_path: {
      type: [String],
    },
    adress: {
      type: String,
    },
    complex: {
      type: String,
    },
    built_year: {
      type: Number,
    },
    class: {
      type: String,
    },
    rooms: {
      type: Number,
    },
    area: {
      type: Number,
    },
    height: {
      type: Number,
    },
    balcon: {
      type: String,
    },
    toilet: {
      type: String,
    },
    otdelka: {
      type: String,
    },
    floor: {
      type: Number,
    },
    price: {
      type: Number,
    },
    extra: {
      type: [String],
    },
    first_line: {
      type: String,
    },
    ready_business: {
      type: String,
    },
    arendator: {
      type: String,
    },
    car_parking: {
      type: String,
    },
    uchastok: {
      type: Number,
    },
    purpose: {
      type: String,
    },
    pdp: {
      type: String,
    },
    project: {
      type: String,
    },
    uchastok_type: {
      type: String,
    },
    office_area: {
      type: Number,
    },
    warehouse_area: {
      type: Number,
    },
    railroad: {
      type: String,
    },
    heating: {
      type: String,
    },
    electricity: {
      type: Number,
    },
    transformator: {
      type: String,
    },
    performance: {
      type: Number,
    },
    mobility: {
      type: String,
    },
    auto_class: {
      type: String,
    },
    marka: {
      type: String,
    },
    model: {
      type: String,
    },
    auto_year: {
        type: Number,
      },
    probeg: {
      type: Number,
    },
    cleared: {
      type: String,
    },
    floors_number: {
      type: Number,
    },
    offices_number: {
      type: Number,
    },
    parking_number: {
      type: Number,
    },

    hotel_rooms: {
      type: Number,
    },
    hotel_rooms_area: {
      type: Number,
    },

    // =========================

    ex_type: {
      type: String,
    },
    ex_region: {
      type: String,
    },
    ex_city: {
      type: String,
    },
    ex_district: {
      type: String,
    },
    ex_adress: {
      type: String,
    },
    ex_complex: {
      type: String,
    },
    ex_built_year: {
      type: Number,
    },
    ex_class: {
      type: String,
    },
    ex_rooms: {
      type: Number,
    },
    ex_area_from: {
      type: Number,
    },
    ex_area_to: {
      type: Number,
    },
    ex_height: {
      type: Number,
    },
    ex_balcon: {
      type: String,
    },
    ex_toilet: {
      type: String,
    },
    ex_otdelka: {
      type: String,
    },
    ex_floor_from: {
      type: Number,
    },
    ex_floor_to: {
      type: Number,
    },
    ex_price_from: {
      type: Number,
    },
    ex_price_to: {
      type: Number,
    },
    ex_first_line: {
      type: String,
    },
    ex_ready_business: {
      type: String,
    },
    ex_arendator: {
      type: String,
    },
    ex_car_parking: {
      type: String,
    },
    ex_uchastok_from: {
      type: Number,
    },
    ex_uchastok_to: {
      type: Number,
    },
    ex_purpose: {
      type: String,
    },
    ex_pdp: {
      type: String,
    },
    ex_project: {
      type: String,
    },
    ex_uchastok_type: {
      type: String,
    },
    ex_office_area_from: {
      type: Number,
    },
    ex_office_area_to: {
      type: Number,
    },
    ex_warehouse_area_from: {
      type: Number,
    },
    ex_warehouse_area_to: {
      type: Number,
    },
    ex_railroad: {
      type: String,
    },
    ex_heating: {
      type: String,
    },
    ex_electricity_from: {
      type: Number,
    },
    ex_electricity_to: {
      type: Number,
    },
    ex_transformator: {
      type: String,
    },
    ex_performance_from: {
      type: Number,
    },
    ex_performance_to: {
      type: Number,
    },
    ex_mobility: {
      type: String,
    },
    ex_auto_class: {
      type: String,
    },
    ex_marka: {
      type: String,
    },
    ex_auto_year_from: {
      type: Number
    },
    ex_auto_year_to: {
      type: Number
    },
    ex_model: {
      type: String,
    },
    ex_probeg: {
      type: Number,
    },
    ex_cleared: {
      type: String,
    },
    ex_floors_number_from: {
      type: Number,
    },
    ex_floors_number_to: {
      type: Number,
    },
    ex_offices_number_from: {
      type: Number,
    },
    ex_offices_number_to: {
      type: Number,
    },
    ex_parking_number_from: {
      type: Number,
    },
    ex_parking_number_to: {
      type: Number,
    },

    ex_hotel_rooms_from: {
      type: Number,
    },
    ex_hotel_rooms_to: {
      type: Number,
    },
    ex_hotel_rooms_area_from: {
      type: Number,
    },
    ex_hotel_rooms_area_to: {
      type: Number,
    },
    client_fio: {
      type: String,
    },
    client_number: {
      type: Number,
    }
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", postSchema);
