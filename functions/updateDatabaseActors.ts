import { updateActors } from "./updateActors";
import { Actor } from "../models/Actor";
import { eachDayOfInterval, format, subDays } from "date-fns";

export const updateDatabaseActors = async () => {
  const monthAgo = subDays(new Date(), 31);
  const result = eachDayOfInterval({
    start: monthAgo,
    end: new Date(),
  });

  const pastMonthArr = result
    .map((date) => format(date, "MM/dd/yyyy"))
    .sort((a: string, b: string) => b.localeCompare(a));

  // Look up actors featured in the past month and blacklist IDs
  const allDbActors =
    (await Actor.find({
      date: {
        $in: pastMonthArr,
      },
    }).catch((e) => console.error(e))) || [];

  const allBlacklistedIDs = allDbActors.map(
    (actor: { [key: string]: number }) => actor.id
  );

  // Look up longer movie terms featured in the past 2 weeks and blacklist terms
  const pastTwoWeeksArr = pastMonthArr.slice(0, 15);
  const allBlacklistedMovieTerms = [
    ...new Set(
      allDbActors
        .filter((actor: { [key: string]: string }) =>
          pastTwoWeeksArr.includes(actor.date)
        )
        .map((actor) =>
          actor.most_popular_recent_movie.title
            .toLowerCase()
            .split(/(\s+)/)
            .find((el: string) => el.length >= 6)
        )
        .filter((el) => el)
        .map((el: string) => el.replace(/[\W_]+/g, "".trim()))
        .filter((el: string) => el.length >= 6)
    ),
  ];
  const resultActors = await updateActors(
    allBlacklistedIDs,
    allBlacklistedMovieTerms
  );

  // Create first actor document for today
  await Actor.create(resultActors.actor1Obj).catch((e) => console.error(e));
  // Create last actor document for today
  await Actor.create(resultActors.actor2Obj).catch((e) => console.error(e));
  console.log(
    `Successfully created first and last actors for ${new Date().toLocaleDateString()}!`
  );
};
