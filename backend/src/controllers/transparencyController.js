import TransparencyRecord from "../models/TransparencyRecord.js";
import asyncHandler from "../utils/asyncHandler.js";

const serializeRecord = (
  record
) => {
  return {
    id: record._id,
    type: record.type,
    category: record.category,
    title: record.title,
    description:
      record.description,
    amount:
      record.amountKurus / 100,
    currency: record.currency,
    transactionDate:
      record.transactionDate,
    documentUrl:
      record.documentUrl,
  };
};

/**
 * GET /api/transparency
 */
export const getPublicTransparency =
  asyncHandler(
    async (req, res) => {
      const currentYear =
        new Date().getUTCFullYear();

      const requestedYear =
        Number.parseInt(
          req.query.year,
          10
        );

      const year =
        Number.isInteger(
          requestedYear
        ) &&
        requestedYear >= 2000 &&
        requestedYear <=
          currentYear + 1
          ? requestedYear
          : currentYear;

      const startDate =
        new Date(
          Date.UTC(
            year,
            0,
            1
          )
        );

      const endDate =
        new Date(
          Date.UTC(
            year + 1,
            0,
            1
          )
        );

      const filter = {
        status: "published",

        transactionDate: {
          $gte: startDate,
          $lt: endDate,
        },
      };

      const [
        totalsResult,
        categoryResult,
        records,
        yearResult,
      ] = await Promise.all([
        TransparencyRecord.aggregate([
          {
            $match: filter,
          },

          {
            $group: {
              _id: "$type",

              totalKurus: {
                $sum:
                  "$amountKurus",
              },

              recordCount: {
                $sum: 1,
              },
            },
          },
        ]),

        TransparencyRecord.aggregate([
          {
            $match: filter,
          },

          {
            $group: {
              _id: {
                type: "$type",
                category:
                  "$category",
              },

              totalKurus: {
                $sum:
                  "$amountKurus",
              },
            },
          },

          {
            $sort: {
              totalKurus: -1,
            },
          },
        ]),

        TransparencyRecord.find(
          filter
        )
          .sort({
            transactionDate: -1,
            createdAt: -1,
          })
          .limit(100)
          .lean(),

        TransparencyRecord.aggregate([
          {
            $match: {
              status:
                "published",
            },
          },

          {
            $group: {
              _id: {
                $year:
                  "$transactionDate",
              },
            },
          },

          {
            $sort: {
              _id: -1,
            },
          },
        ]),
      ]);

      const income =
        totalsResult.find(
          (item) =>
            item._id ===
            "income"
        );

      const expense =
        totalsResult.find(
          (item) =>
            item._id ===
            "expense"
        );

      const totalIncome =
        (income?.totalKurus ||
          0) / 100;

      const totalExpense =
        (expense?.totalKurus ||
          0) / 100;

      res.status(200).json({
        success: true,

        data: {
          year,

          availableYears:
            yearResult.map(
              (item) => item._id
            ),

          totals: {
            income:
              totalIncome,

            expense:
              totalExpense,

            balance:
              totalIncome -
              totalExpense,

            recordCount:
              (income?.recordCount ||
                0) +
              (expense?.recordCount ||
                0),
          },

          categories:
            categoryResult.map(
              (item) => ({
                type:
                  item._id.type,

                category:
                  item._id
                    .category,

                total:
                  item.totalKurus /
                  100,
              })
            ),

          records:
            records.map(
              serializeRecord
            ),
        },
      });
    }
  );