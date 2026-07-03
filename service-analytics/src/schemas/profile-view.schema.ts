import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type ProfileViewDocument = ProfileView & Document;

@Schema({ timestamps: true, collection: "profile_views" })
export class ProfileView {
  @Prop({
    required: true,
    unique: true,
    index: true,
  })
  eventId!: string;

  @Prop({ required: true })
  profileId!: string;

  @Prop({ required: true })
  viewerRole!: string;

  @Prop({ required: true })
  beach!: string;

  @Prop({ required: true })
  timestamp!: Date;
}

export const ProfileViewSchema = SchemaFactory.createForClass(ProfileView);
