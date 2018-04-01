library("seqinr")

setwd("/Users/jtimmons/Desktop/speech-test/analysis")

orig <- readLines("./manual.txt")
auto <- readLines("./transcript.txt")

orig <- paste(orig, collapse="") 
auto <- paste(auto, collapse="") 

orig <- sapply(orig, tolower)
auto <- sapply(auto, tolower)

orig <- gsub("([ -])|[[:punct:]]", ' ', orig)
auto <- gsub("([ -])|[[:punct:]]", ' ', auto)

orig <- strsplit(orig, " ")[[1]]
auto <- strsplit(auto, " ")[[1]]

orig <- orig[nchar(orig) > 2]
auto <- auto[nchar(auto) > 2]

ol <- length(orig)
al <- length(auto)

xs = rep(NA, ol * al)
ys = rep(NA, ol * al)

counter <- 1
for (i in seq(1, length(auto))) {
  y <- which(auto == orig[i])

  for (val in y) {
    xs[counter] <- i
    ys[counter] <- val
    counter <- counter + 1
  }
}

xs <- xs[!is.na(xs)]
ys <- ys[!is.na(ys)]

png(filename="./alignment.png")
plot(xs, ys, type = "point", cex = 0.01, xlab = "orig", ylab="auto")
dev.off()

plot(xs, ys, type = "point", cex = 0.01, xlab = "orig", ylab="auto")
